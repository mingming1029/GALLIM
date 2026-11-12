-- schema_v2.sql
-- SQL Editor에서 한 번 실행합니다.
--
-- 이 스크립트는 기존 public.cases, public.records 테이블과
-- 그 안에 있던 사례·판단 데이터를 모두 지웁니다.
-- 사례는 이제 앱 코드의 DEMO_CASES에서 읽으므로 cases 테이블은 만들지 않습니다.
-- 지운 뒤 judgments 테이블만 만듭니다.
-- service role 키는 이 파일과 앱 어디에도 넣지 않습니다.

drop table if exists public.records;
drop table if exists public.cases;

create table public.judgments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid(),
  case_id text not null,
  item_scores jsonb not null,
  my_total int not null,
  my_level text not null,
  ai_total int not null,
  ai_level text not null,
  final_decision text not null,
  reason_category text default '',
  reason_text text default '',
  created_at timestamptz not null default now()
);

alter table public.judgments enable row level security;

create policy "judgments read" on public.judgments
  for select using (user_id = auth.uid());

create policy "judgments insert" on public.judgments
  for insert with check (user_id = auth.uid());

-- 익명 로그인 사용자는 authenticated 역할입니다. 권한이 없으면 RLS 전에 거절됩니다.
grant select, insert on table public.judgments to authenticated;
