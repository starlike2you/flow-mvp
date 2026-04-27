create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'member');
create type public.payment_status as enum ('paid', 'refunded', 'pending');
create type public.match_status as enum ('scheduled', 'completed', 'no_show', 'cancelled', 'rematch_queue');
create type public.session_status as enum ('scheduled', 'live', 'completed');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nickname text not null,
  level text not null,
  interests text[] not null default '{}',
  intro text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role public.user_role not null,
  primary key (user_id, role)
);

create table public.availability (
  user_id uuid not null references public.users(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_hour int not null check (start_hour between 0 and 23),
  end_hour int not null check (end_hour between 1 and 24),
  check (start_hour < end_hour),
  primary key (user_id, weekday, start_hour, end_hour)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.users(id),
  user_b uuid not null references public.users(id),
  scheduled_at timestamptz not null,
  status public.match_status not null default 'scheduled',
  daily_room_url text not null,
  check (user_a <> user_b)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  status public.session_status not null default 'scheduled',
  recording_url text,
  transcript_url text
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  prompt text not null,
  response text not null,
  created_at timestamptz not null default now()
);

create table public.study_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  content_json jsonb not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

create table public.audiobooks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  script text not null,
  audio_url text not null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  rapid_order_id text not null unique,
  status public.payment_status not null default 'pending',
  deposit_amount int not null,
  refunded_at timestamptz
);

create table public.weekly_contents (
  id uuid primary key default gen_random_uuid(),
  week_no int not null unique,
  title text not null,
  content_md text not null,
  questions text[] not null default '{}'
);

alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.availability enable row level security;
alter table public.matches enable row level security;
alter table public.sessions enable row level security;
alter table public.ai_messages enable row level security;
alter table public.study_notes enable row level security;
alter table public.audiobooks enable row level security;
alter table public.payments enable row level security;
alter table public.weekly_contents enable row level security;

create policy "members can read own user" on public.users
  for select using (auth.uid() = id);

create policy "members can read own availability" on public.availability
  for select using (auth.uid() = user_id);

create policy "members can read own payments" on public.payments
  for select using (auth.uid() = user_id);

create policy "members can read own ai messages" on public.ai_messages
  for select using (auth.uid() = user_id);

create policy "weekly content is readable by authenticated users" on public.weekly_contents
  for select to authenticated using (true);
