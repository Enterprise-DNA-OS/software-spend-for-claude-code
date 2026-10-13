#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const reads={
 applications:'select * from applications order by name',
 contracts:'select c.*,a.name application from contracts c join applications a on a.id=c.application_id order by c.name',
 assignments:'select x.*,a.name application from assignments x join applications a on a.id=x.application_id order by a.name,x.name',
 expenses:'select x.*,a.name application from expenses x join applications a on a.id=x.application_id order by spent_on desc,name',
 renewals:'select application,name,owner,notice_date,end_date,days_to_notice,contract_value,currency from renewal_calendar order by notice_date nulls first,name',
 'notice-deadlines':'select application,name,owner,notice_date,days_to_notice from renewal_calendar where days_to_notice<=60 or notice_date is null order by notice_date nulls first,name',
 'licence-review':'select application,owner,purchased_seats,assigned,purchased_seats-assigned unassigned_seats,stale_observations,inactive_candidates from licence_position order by application',
 'inactive-seats':`select a.name application,x.name seat,x.last_used_on,x.observed_on,x.review_due from assignments x join applications a on a.id=x.application_id where x.status='active' and x.observed_on>=current_date-30 and x.last_used_on<current_date-60 order by a.name,x.name`,
 'stale-usage':`select a.name application,x.name seat,x.observed_on from assignments x join applications a on a.id=x.application_id where x.status='active' and (x.observed_on is null or x.observed_on<current_date-30) order by a.name,x.name`,
 'category-overlap':`select category,count(*) applications,string_agg(name,', ' order by name) names from applications where status='active' and btrim(category)<>'' group by category having count(*)>1 order by category`,
 'spend-review':`select a.name application,e.currency,count(*) invoices,sum(e.amount) recorded_spend,min(e.spent_on) first_invoice,max(e.spent_on) last_invoice from expenses e join applications a on a.id=e.application_id group by a.name,e.currency order by a.name,e.currency`,
 commitments:`select currency,count(*) contracts,sum(contract_value) recorded_contract_value from contracts where status='active' and contract_value is not null group by currency order by currency`,
 'owner-workload':`select coalesce(nullif(owner,''),'Unassigned') owner,count(*) contracts,count(*) filter(where days_to_notice<=30 or notice_date is null) needs_attention from renewal_calendar group by owner order by needs_attention desc,owner`,
 decisions:`select d.id,c.name contract,d.decision,d.actor,d.approver,d.rationale,d.evidence,d.created_at,(d.contract_snapshot->>'version')::integer=c.version current_contract_version from decisions d join contracts c on c.id=d.contract_id order by d.created_at desc`,
 attention:'select * from attention_items order by entity,name,issue',
 compliance:'select * from compliance_findings order by rule,name',
 history:'select * from audit_log order by created_at,id'
};
const fields={
 applications:{name:'text',vendor:'text',category:'text',owner:'text',department:'text',personal_data:'bool',security_review_due:'date',retention_review_due:'date',evidence:'text',status:['active','retired']},
 contracts:{name:'text',application_id:'app',status:['draft','active','ended','cancelled'],start_date:'date',end_date:'date',notice_days:'int',contract_value:'money',currency:'currency',purchased_seats:'int',evidence:'text'},
 assignments:{name:'text',application_id:'app',status:['active','removed'],last_used_on:'date',observed_on:'date',review_due:'date',evidence:'text'},
 expenses:{name:'text',application_id:'app',spent_on:'date',amount:'money',currency:'currency',evidence:'text'}
};
export const commands=[...Object.keys(reads),'show','add','update','log','record-usage','record-decision','import','export','weekly-review','draft-renewal-brief','draft-access-review','help'];
const nonempty=(v,n)=>{if(typeof v!=='string'||!v.trim())throw Error(`${n} is required`);return v.trim();};
function options(args){const o={},pos=[];for(const a of args){if(a.startsWith('--')){const [k,...v]=a.slice(2).split('=');if(k in o)throw Error(`Duplicate option --${k}`);o[k]=v.length?v.join('='):true;}else pos.push(a);}return {o,pos};}
function date(v,n,format='YYYY-MM-DD'){
 if(v===''||v===null)return null;
 let s=String(v);if(format!=='YYYY-MM-DD'){const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(!m)throw Error(`${n} must use ${format}`);s=format==='DD/MM/YYYY'?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`${n} must be a real date (${format})`);return s;
}
function number(v,n,int=false){if(v===''||v===null)return null;const s=String(v);if(!(int?/^\d+$/:/^\d+(?:\.\d{1,2})?$/).test(s)||!Number.isSafeInteger(Number(s)*(int?1:100))&&Math.abs(Number(s)*100-Math.round(Number(s)*100))>0.00001)throw Error(`${n} must be a non-negative ${int?'integer':'amount with at most two decimals'}`);if(!Number.isFinite(Number(s))||Number(s)>1e12)throw Error(`${n} is too large`);return int?Number(s):s;}
async function resolve(db,entity,key,lock=false){
 if(!fields[entity])throw Error('Entity must be applications, contracts, assignments or expenses');nonempty(key,'record');
 const rows=await db.query(`select * from ${entity} where lower(name)=lower($1) or id::text ilike $2 order by name,id${lock?' for update':''}`,[key,`${key}%`]);
 if(rows.length!==1)throw Error(`${rows.length?'Ambiguous':'No'} ${entity} match: ${key}${rows.length?'\n'+rows.map(r=>`${r.id} ${r.name}`).join('\n'):''}`);return rows[0];
}
async function audit(db,entity,before,after,actor,action){await db.query('insert into audit_log(entity,record_id,action,actor,before_data,after_data) values($1,$2,$3,$4,$5,$6)',[entity,after.id,action,actor,before?JSON.stringify(before):null,JSON.stringify(after)]);}
async function transaction(db,fn,dry=false){await db.exec('begin');try{const result=await fn();await db.exec(dry?'rollback':'commit');return result;}catch(e){await db.exec('rollback');throw e;}}
async function values(db,entity,o){
 const out={};for(const [option,v] of Object.entries(o)){
  if(['actor','json'].includes(option))continue;
  const k=option==='app'?'application_id':option.replaceAll('-','_'),type=fields[entity]?.[k];if(!type)throw Error(`Unknown ${entity} field --${option}`);
  if(type==='app')out[k]=(await resolve(db,'applications',v)).id;
  else if(type==='date')out[k]=date(v,k);
  else if(type==='int'||type==='money')out[k]=number(v,k,type==='int');
  else if(type==='currency'){if(v==='')out[k]=null;else if(!/^[A-Z]{3}$/.test(v))throw Error('currency must be a three-letter uppercase code');else out[k]=v;}
  else if(type==='bool'){if(!['true','false'].includes(v))throw Error(`${k} must be true or false`);out[k]=v==='true';}
  else if(Array.isArray(type)){if(!type.includes(v))throw Error(`${k} must be ${type.join(', ')}`);out[k]=v;}
  else {if(typeof v!=='string')throw Error(`${k} needs a value`);out[k]=v.trim();}
 }
 return out;
}
async function mutate(db,entity,o,before=null,extra={}){
 const actor=nonempty(o.actor,'--actor'),v={...await values(db,entity,o),...extra};
 if(!Object.keys(v).length)throw Error('No fields supplied');
 const combined={...before,...v};
 if(entity==='assignments'){
  const today=new Date().toISOString().slice(0,10);
  for(const k of ['last_used_on','observed_on'])if(combined[k]&&combined[k]>today)throw Error(`${k} cannot be in the future`);
  if(combined.last_used_on&&!combined.observed_on)throw Error('Usage needs observed-on');
  if(v.status==='removed'&&!v.evidence)throw Error('Removing a recorded assignment needs --evidence of the external action');
 }
 const keys=Object.keys(v),params=Object.values(v);
 const sql=before?`update ${entity} set ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} where id=$${keys.length+1} returning *`:`insert into ${entity}(${keys.join(',')}) values(${keys.map((_,i)=>`$${i+1}`).join(',')}) returning *`;
 if(before)params.push(before.id);const row=(await db.query(sql,params))[0];await audit(db,entity,before,row,actor,before?'update':'add');return row;
}
const columnMap={name:['Contract name'],application:['Application name'],status:['Status'],start_date:['Start date','Contract start date'],end_date:['End date','Contract end date'],notice_days:['Notice period (days)','Notice days'],contract_value:['Contract value'],currency:['Contract currency'],purchased_seats:['Purchased seats','Number of licenses'],evidence:['Evidence','Contract URL'],owner:['Owner','Contract owner']};
async function importTorii(db,o){
 nonempty(o.actor,'--actor');const file=nonempty(o.file,'--file');
 const format=o['date-format']||'YYYY-MM-DD';if(!['YYYY-MM-DD','DD/MM/YYYY','MM/DD/YYYY'].includes(format))throw Error('Unsupported date-format');
 const mapping=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};
 for(const [k,v] of Object.entries(mapping))if(!(k in columnMap)||typeof v!=='string')throw Error(`Invalid column mapping: ${k}`);
 const statusMap=o['status-map']?JSON.parse(fs.readFileSync(o['status-map'],'utf8')):{};
 const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'').replace(/^sep=,\r?\n/i,'');
 const rows=parseCsv(text);if(!rows.length)throw Error('No contract rows found');
 const get=(row,k)=>pick(row,...(mapping[k]?[mapping[k]]:columnMap[k]));
 for(const k of ['name','application','status'])if(!Object.keys(rows[0]).some(h=>(mapping[k]?[mapping[k]]:columnMap[k]).some(a=>a.toLowerCase()===h.toLowerCase())))throw Error(`Missing required column: ${columnMap[k][0]}`);
 return transaction(db,async()=>{
  const seen=new Set(),result={dry_run:!!o['dry-run'],added:0,updated:0,unchanged:0,applications_added:0,warnings:[]};
  for(const [i,row] of rows.entries()){
   const name=nonempty(get(row,'name'),`row ${i+2} Contract name`),appName=nonempty(get(row,'application'),`row ${i+2} Application name`);
   const key=JSON.stringify([appName.toLowerCase(),name.toLowerCase()]);if(seen.has(key))throw Error(`Duplicate source contract: ${name}`);seen.add(key);
   const originalStatus=get(row,'status'),status=statusMap[originalStatus]||originalStatus.toLowerCase();if(!fields.contracts.status.includes(status))throw Error(`Unknown Status ${originalStatus}; provide --status-map`);
   const source=JSON.stringify(row),existing=(await db.query('select * from contracts where source_key=$1 for update',[key]))[0];
   if(existing&&JSON.stringify(existing.source_data)===JSON.stringify(JSON.parse(source))){result.unchanged++;continue;}
   // jsonb key order is canonical, so compare structurally in the database.
   if(existing&&(await db.query('select source_data=$1::jsonb same from contracts where id=$2',[source,existing.id]))[0].same){result.unchanged++;continue;}
   if(existing&&!o['update-existing'])throw Error(`Source contract changed: ${name}; inspect then use --update-existing`);
   let app=(await db.query('select * from applications where lower(name)=lower($1)',[appName]))[0];
   if(!app){app=await mutate(db,'applications',{name:appName,owner:get(row,'owner'),actor:o.actor});result.applications_added++;}
   if(!existing&&(await db.query('select id from contracts where application_id=$1 and lower(name)=lower($2)',[app.id,name])).length)throw Error(`Existing local contract ${name}: reconcile before import`);
   const opts={actor:o.actor,name,app:app.id,status};
   for(const k of ['start_date','end_date'])opts[k.replaceAll('_','-')]=date(get(row,k),k,format)||'';
   for(const k of ['notice_days','purchased_seats','contract_value'])opts[k.replaceAll('_','-')]=get(row,k);
   opts.currency=get(row,'currency');opts.evidence=get(row,'evidence');
   if(opts['contract-value']&&!opts.currency)throw Error(`Contract currency missing for ${name}; original currency is required`);
   await mutate(db,'contracts',opts,existing,{source_key:key,source_data:source});result[existing?'updated':'added']++;
   const known=Object.values(columnMap).flat().concat(Object.values(mapping));const extra=Object.keys(row).filter(h=>!known.some(k=>k.toLowerCase()===h.toLowerCase()));
   if(extra.length)result.warnings.push(`${name}: retained unmapped columns in source_data: ${extra.join(', ')}`);
  }
  return result;
 },!!o['dry-run']);
}
export function display(rows){if(!Array.isArray(rows))return JSON.stringify(rows,null,2);if(!rows.length)return '(none)';const keys=Object.keys(rows[0]).filter(k=>!['source_data','before_data','after_data','contract_snapshot'].includes(k));return table(rows,keys.map(key=>({key,label:key,format:v=>v instanceof Date?v.toISOString():v})));}
export async function execute(db,args){
 const {o,pos}=options(args),cmd=pos[0]||'help';
 if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}; use help`);
 const allowed={help:[],show:[],log:['actor','body'],'record-usage':['actor','last-used-on','observed-on','review-due','evidence'],'record-decision':['actor','approver','decision','rationale','evidence','expected-version'],import:['actor','file','date-format','map','status-map','dry-run','update-existing'],export:['file'],'weekly-review':[],'draft-renewal-brief':[],'draft-access-review':[]};
 if(allowed[cmd])for(const [k,v] of Object.entries(o)){
  if(k!=='json'&&!allowed[cmd].includes(k))throw Error(`Unknown option --${k}`);
  if(['json','dry-run','update-existing'].includes(k)){if(v!==true)throw Error(`--${k} takes no value`);}
  else if(v===true)throw Error(`--${k} needs a value`);
 }

 if(reads[cmd]){for(const k of Object.keys(o))if(k!=='json')throw Error(`Unknown option --${k}`);return db.query(reads[cmd]);}
 if(cmd==='help')return {commands,fields,usage:'npm run spend -- <command> [entity] [name-or-id] --field=value --actor=Name --json',import:'import torii --file=contracts.csv --actor=Name [--dry-run] [--date-format=YYYY-MM-DD] [--map=mapping.json] [--status-map=status.json] [--update-existing]'};
 if(cmd==='show'){const row=await resolve(db,pos[1],pos[2]);return {...row,history:await db.query('select * from audit_log where entity=$1 and record_id=$2 order by created_at',[pos[1],row.id])};}
 if(cmd==='add'||cmd==='update'){if(!fields[pos[1]])throw Error('Unknown entity');return transaction(db,async()=>mutate(db,pos[1],o,cmd==='update'?await resolve(db,pos[1],pos[2],true):null));}
 if(cmd==='log')return transaction(db,async()=>{const app=await resolve(db,'applications',pos[1]),actor=nonempty(o.actor,'--actor');const row=(await db.query('insert into notes(application_id,body,actor) values($1,$2,$3) returning *',[app.id,nonempty(o.body,'--body'),actor]))[0];await audit(db,'notes',null,row,actor,'log');return row;});
 if(cmd==='record-usage')return transaction(db,async()=>{const before=await resolve(db,'assignments',pos[1],true);nonempty(o.evidence,'--evidence');nonempty(o['observed-on'],'--observed-on');nonempty(o['last-used-on'],'--last-used-on');return mutate(db,'assignments',o,before);});
 if(cmd==='record-decision')return transaction(db,async()=>{
  const c=await resolve(db,'contracts',pos[1],true),actor=nonempty(o.actor,'--actor'),approver=nonempty(o.approver,'--approver');
  if(actor.toLowerCase()===approver.toLowerCase())throw Error('Approver must differ from actor');
  if(c.status!=='active'||!c.start_date||!c.end_date||c.notice_days===null||c.contract_value===null||!c.evidence.trim())throw Error('Active contract needs dates, notice days, value and evidence before a decision');
  if(String(c.version)!==o['expected-version'])throw Error('Contract changed or --expected-version missing; show the record again');
  const row=(await db.query('insert into decisions(contract_id,decision,rationale,actor,approver,evidence,contract_snapshot) values($1,$2,$3,$4,$5,$6,$7) returning *',[c.id,nonempty(o.decision,'--decision'),nonempty(o.rationale,'--rationale'),actor,approver,nonempty(o.evidence,'--evidence'),JSON.stringify(c)]))[0];await audit(db,'decisions',null,row,actor,'record-decision');return row;
 });
 if(cmd==='import'){if(pos[1]!=='torii')throw Error('Only import torii is supported');return importTorii(db,o);}
 if(cmd==='export'){const out={format:'software-spend-v1',generated_at:new Date().toISOString()};for(const t of [...Object.keys(fields),'decisions','notes','audit_log'])out[t]=await db.query(`select * from ${t} order by id`);if(o.file){fs.writeFileSync(o.file,JSON.stringify(out,null,2)+'\n',{flag:'wx',mode:0o600});return {file:path.resolve(o.file)};}return out;}
 const groups={'weekly-review':['notice-deadlines','licence-review','compliance'],'draft-renewal-brief':['renewals','commitments','category-overlap'],'draft-access-review':['inactive-seats','stale-usage','compliance']};
 const sections=[];for(const key of groups[cmd])sections.push(`## ${key}\n\n${display(await db.query(reads[key]))}`);
 const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`${cmd}-${new Date().toISOString().replace(/[:.]/g,'-')}.md`);
 fs.writeFileSync(file,`# ${cmd}\n\nDraft for review. Fictional data when using the demo. No vendor action has been taken.\n\n${sections.join('\n\n')}\n`,{flag:'wx',mode:0o600});return {file};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await execute(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):display(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
