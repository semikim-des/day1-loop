begin;

delete from public.claims;
delete from public.players;

insert into public.players (code, nickname) values
  ('1001', '김세미 (👑)'),
  ('1002', '김하영'),
  ('1003', '노수연'),
  ('1004', '이승연'),
  ('1005', '김성은'),
  ('1006', '이기쁨'),
  ('1007', '이수진'),
  ('1008', '장은서'),
  ('1009', '임다혜'),
  ('1010', '김송이'),
  ('1011', '황지예');

revoke update on table public.players from anon;
revoke update on table public.players from authenticated;

commit;
