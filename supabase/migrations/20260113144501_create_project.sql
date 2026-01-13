-- Migration: Create projects table
-- Purpose: Store user-owned projects with name and description
-- Affected tables: projects (new)
-- Special considerations: RLS enabled, only project owner can modify

-- Create the projects table
create table public.projects (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add table comment
comment on table public.projects is 'User-owned projects. Each project belongs to a single user who has full control over it.';

-- Add column comments
comment on column public.projects.user_id is 'Reference to the user who owns this project.';
comment on column public.projects.name is 'The display name of the project.';
comment on column public.projects.description is 'Optional description of the project, can be a few sentences long.';

-- Enable Row Level Security
alter table public.projects enable row level security;

-- RLS Policies for authenticated users

-- SELECT: Authenticated users can only view their own projects
create policy "authenticated users can select own projects"
  on public.projects
  for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT: Authenticated users can create projects for themselves
create policy "authenticated users can insert own projects"
  on public.projects
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- UPDATE: Only the project owner can update their projects
create policy "authenticated users can update own projects"
  on public.projects
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: Only the project owner can delete their projects
create policy "authenticated users can delete own projects"
  on public.projects
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policies for anonymous users
-- Anonymous users have no access to projects

-- SELECT: Anonymous users cannot view any projects
create policy "anon users cannot select projects"
  on public.projects
  for select
  to anon
  using (false);

-- INSERT: Anonymous users cannot create projects
create policy "anon users cannot insert projects"
  on public.projects
  for insert
  to anon
  with check (false);

-- UPDATE: Anonymous users cannot update projects
create policy "anon users cannot update projects"
  on public.projects
  for update
  to anon
  using (false)
  with check (false);

-- DELETE: Anonymous users cannot delete projects
create policy "anon users cannot delete projects"
  on public.projects
  for delete
  to anon
  using (false);

-- Create a trigger to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_projects_updated
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

-- Create index on user_id for faster lookups
create index projects_user_id_idx on public.projects (user_id);

