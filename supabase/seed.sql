insert into applications(id,name,vendor,category,owner,department,personal_data,security_review_due,retention_review_due,evidence) values
 ('10000000-0000-0000-0000-000000000001','Harbour CRM','Harbour Systems','CRM','Mere','Sales',true,current_date-10,current_date+90,'Contract register / H-01'),
 ('10000000-0000-0000-0000-000000000002','Kauri Projects','Kauri Software','Projects','Hana','Operations',true,current_date+60,current_date-5,'Review / K-02'),
 ('10000000-0000-0000-0000-000000000003','Rimu Boards','Rimu Systems','Projects','','Operations',false,null,null,''),
 ('10000000-0000-0000-0000-000000000004','Tui Analytics','Tui Reports','Analytics','Aroha','Finance',false,null,null,'Review / T-04') on conflict do nothing;
insert into contracts(id,application_id,name,status,start_date,end_date,notice_days,contract_value,currency,purchased_seats,evidence) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Harbour annual','active',current_date-330,current_date+35,60,24000,'NZD',3,'Signed H-01'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Kauri annual','active',current_date-280,current_date+85,60,12000,'AUD',8,'Signed K-02'),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Rimu annual','active',current_date-100,null,null,null,null,null,''),
 ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','Tui annual','active',current_date-200,current_date+165,30,9000,'NZD',2,'Signed T-04') on conflict do nothing;
insert into assignments(id,application_id,name,last_used_on,observed_on,review_due,evidence) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Sales seat 01',current_date-100,current_date-2,current_date+30,'Usage export H-01'),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Sales seat 02',current_date-2,current_date-1,current_date+30,'Usage export H-01'),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Operations seat 01',current_date-70,current_date-65,current_date-5,''),
 ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','Finance seat 01',current_date-3,current_date-1,current_date+60,'Usage export T-04') on conflict do nothing;
insert into expenses(id,application_id,name,spent_on,amount,currency,evidence) values
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','DEMO-H-1001',current_date-10,2000,'NZD','Fictional invoice H-1001'),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','DEMO-K-1001',current_date-5,1000,'AUD','Fictional invoice K-1001') on conflict do nothing;
