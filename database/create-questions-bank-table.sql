-- Questions Bank Table
-- Stores reusable questions that can be inserted into quizzes

create table if not exists questions_bank (
  id uuid primary key default gen_random_uuid(),
  title text, -- optional short label
  question text not null,
  type text not null check (type in ('multiple_choice','multiple_answer','short_answer')),
  options jsonb,            -- array of options (for choice types)
  correct jsonb,            -- number or array for multi, or array of accepted strings for short
  points integer not null default 1,
  category text,
  tags jsonb default '[]'::jsonb,
  created_by uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Optional RLS policies (adjust to your security model)
alter table questions_bank enable row level security;
do $$ begin
  create policy "Everyone can read questions_bank" on questions_bank for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Service key can modify questions_bank" on questions_bank for all using (true) with check (true);
exception when duplicate_object then null; end $$;


