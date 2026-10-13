create table applications (
 id uuid primary key default gen_random_uuid(), name text not null check (btrim(name)<>''), vendor text not null default '',
 category text not null default '', owner text not null default '', department text not null default '',
 personal_data boolean not null default false, security_review_due date, retention_review_due date, evidence text not null default '',
 status text not null default 'active' check(status in ('active','retired')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index applications_name_uq on applications(lower(name));
create table contracts (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id),
 name text not null check(btrim(name)<>''), status text not null default 'draft' check(status in ('draft','active','ended','cancelled')),
 start_date date, end_date date, notice_days integer check(notice_days between 0 and 730),
 contract_value numeric(16,2) check(contract_value>=0), currency text check(currency ~ '^[A-Z]{3}$'),
 purchased_seats integer check(purchased_seats>=0), evidence text not null default '',
 source_key text unique, source_data jsonb, version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_date is null or start_date is null or end_date>=start_date),
 check((contract_value is null)=(currency is null))
);
create index contracts_app_idx on contracts(application_id);
create unique index contracts_name_uq on contracts(application_id,lower(name));
create index contracts_end_idx on contracts(end_date) where status='active';
create table assignments (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id),
 name text not null check(btrim(name)<>''), status text not null default 'active' check(status in ('active','removed')),
 last_used_on date, observed_on date, review_due date, evidence text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(last_used_on is null or observed_on is null or last_used_on<=observed_on)
);
create unique index assignments_identity_uq on assignments(application_id,lower(name));
create table expenses (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id),
 name text not null unique check(btrim(name)<>''), spent_on date not null, amount numeric(16,2) not null check(amount>=0),
 currency text not null check(currency ~ '^[A-Z]{3}$'), evidence text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index expenses_app_date_idx on expenses(application_id,spent_on);
create table decisions (
 id uuid primary key default gen_random_uuid(), contract_id uuid not null references contracts(id),
 decision text not null check(decision in ('renew','reduce','cancel','defer')), rationale text not null check(btrim(rationale)<>''),
 actor text not null, approver text not null, evidence text not null check(btrim(evidence)<>''),
 contract_snapshot jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(lower(btrim(actor))<>lower(btrim(approver)))
);
create index decisions_contract_idx on decisions(contract_id);
create table notes (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id),
 body text not null check(btrim(body)<>''), actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index notes_app_idx on notes(application_id);
create table audit_log (
 id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, action text not null,
 actor text not null, before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);
create index audit_record_idx on audit_log(entity,record_id,created_at);
create function touch_updated_at() returns trigger language plpgsql as $$begin new.updated_at=clock_timestamp();if tg_table_name='contracts' then new.version=old.version+1;end if;return new;end$$;
do $$declare t text;begin
 foreach t in array array['applications','contracts','assignments','expenses','decisions','notes'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end$$;
alter table audit_log enable row level security;
revoke all on audit_log from public;
create view renewal_calendar with(security_invoker=true) as
 select c.id,c.name,a.name application,a.owner,a.department,c.status,c.start_date,c.end_date,
 c.end_date-c.notice_days notice_date,(c.end_date-c.notice_days)-current_date days_to_notice,
 c.contract_value,c.currency,c.purchased_seats,c.evidence
 from contracts c join applications a on a.id=c.application_id where c.status='active';
create view licence_position with(security_invoker=true) as
 select a.id,a.name application,a.owner,
 (select sum(c.purchased_seats) from contracts c where c.application_id=a.id and c.status='active' and c.start_date<=current_date and c.end_date>=current_date) purchased_seats,
 (select count(*) from assignments x where x.application_id=a.id and x.status='active') assigned,
 (select count(*) from assignments x where x.application_id=a.id and x.status='active' and (x.observed_on is null or x.observed_on<current_date-30)) stale_observations,
 (select count(*) from assignments x where x.application_id=a.id and x.status='active' and x.observed_on>=current_date-30 and x.last_used_on<current_date-60) inactive_candidates
 from applications a where a.status='active';
create view attention_items with(security_invoker=true) as
 select a.id,'applications' entity,a.name,'Missing owner' issue from applications a where a.status='active' and btrim(a.owner)=''
 union all select c.id,'contracts',c.name,'Missing renewal dates or notice period' from contracts c where c.status='active' and (start_date is null or end_date is null or notice_days is null)
 union all select id,'contracts',name,'Notice deadline passed or due within 30 days' from renewal_calendar where days_to_notice<=30
 union all select id,'applications',application,'Licence observations need refreshing' from licence_position where stale_observations>0
 union all select id,'applications',application,'Assigned licences exceed purchased seats' from licence_position where assigned>purchased_seats
 union all select id,'contracts',name,'Missing contract value' from contracts where status='active' and contract_value is null;
create view compliance_findings with(security_invoker=true) as
 select id,'applications' entity,name,'NZ-IPP5' rule,'Security review missing or overdue' finding from applications
 where status='active' and personal_data and (security_review_due is null or security_review_due<current_date or btrim(evidence)='')
 union all select id,'applications',name,'NZ-IPP9','Retention review missing or overdue' from applications where status='active' and personal_data and (retention_review_due is null or retention_review_due<current_date)
 union all select x.id,'assignments',a.name||': '||x.name,'LOCAL-ACCESS','Access review missing, overdue or unsupported' from assignments x join applications a on a.id=x.application_id where x.status='active' and (x.review_due is null or x.review_due<current_date or btrim(x.evidence)='')
 union all select id,'contracts',name,'LOCAL-CONTRACT','Active contract lacks source evidence' from contracts where status='active' and btrim(evidence)='';
