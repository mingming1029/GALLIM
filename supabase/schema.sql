-- 이 파일은 이전 구조입니다. 지금은 supabase/schema_v2.sql을 실행합니다.
-- SQL Editor에서 한 번 실행합니다.
-- service role 키는 이 파일과 앱 어디에도 넣지 않습니다.

create table cases (
  id uuid primary key default gen_random_uuid(),
  code text not null,                 -- 화면에 보이는 사례 번호, 예: K-011
  user_id uuid references auth.users(id) default auth.uid(),
  is_example boolean not null default false,
  source text not null default 'generated',   -- generated | manual
  age_band text not null,
  months int not null check (months between 1 and 36),
  factors jsonb not null,             -- [{key,name,lv,note}]
  score int not null check (score between 0 and 100),
  level text not null check (level in ('low','mid','high')),
  memo text default '',
  memo_dir text default 'neu',
  memo_cat text default '기타',
  created_at timestamptz not null default now()
);
create table records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid references auth.users(id) default auth.uid(),
  is_example boolean not null default false,
  level text not null check (level in ('low','mid','high')),
  decision text not null check (decision in ('up','keep','down')),
  reason_cat text default '',
  reason_text text default '' check (char_length(reason_text) <= 60),
  created_at timestamptz not null default now()
);
alter table cases enable row level security;
alter table records enable row level security;
create policy "cases read" on cases for select using (is_example or user_id = auth.uid());
create policy "cases insert" on cases for insert with check (user_id = auth.uid() and not is_example);
create policy "records read" on records for select using (is_example or user_id = auth.uid());
create policy "records insert" on records for insert with check (user_id = auth.uid() and not is_example);

-- Data API는 테이블 권한이 있어야 정책을 탑니다. 익명 로그인 사용자는 authenticated 역할입니다.
grant select, insert on table public.cases to authenticated;
grant select, insert on table public.records to authenticated;
