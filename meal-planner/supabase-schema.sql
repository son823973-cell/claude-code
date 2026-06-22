-- Run this in Supabase SQL Editor

create table households (
  code text primary key,
  created_at timestamptz default now()
);

create table meals (
  id uuid default gen_random_uuid() primary key,
  household_code text references households(code) on delete cascade,
  date date not null,
  name text not null,
  memo text,
  created_at timestamptz default now()
);

create table shopping_items (
  id uuid default gen_random_uuid() primary key,
  household_code text references households(code) on delete cascade,
  name text not null,
  quantity text,
  checked boolean default false,
  created_at timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table meals;
alter publication supabase_realtime add table shopping_items;

-- Row Level Security (allow all for household code holders)
alter table households enable row level security;
alter table meals enable row level security;
alter table shopping_items enable row level security;

create policy "Public access" on households for all using (true);
create policy "Public access" on meals for all using (true);
create policy "Public access" on shopping_items for all using (true);
