-- Migration: Create project_decisions table
-- Purpose: Store user-selected options for each system design decision within a project
-- Affected tables: project_decisions (new)
-- Special considerations: RLS enabled, access controlled through project ownership

-- Create the project_decisions table
create table public.project_decisions (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects (id) on delete cascade,
  decision_id text not null,
  selected_option text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, decision_id)
);

-- Add table comment
comment on table public.project_decisions is 'Stores the selected option for each system design decision within a project. Each project can have at most one selection per decision.';

-- Add column comments
comment on column public.project_decisions.project_id is 'Reference to the project this decision belongs to.';
comment on column public.project_decisions.decision_id is 'The decision identifier from the categories catalog (e.g., 1.1 for Framework/Library, 2.1 for API Paradigm).';
comment on column public.project_decisions.selected_option is 'The name of the selected option (e.g., React, PostgreSQL, Vercel).';
comment on column public.project_decisions.note is 'Optional note providing additional context or reasoning for this decision.';

-- Enable Row Level Security
alter table public.project_decisions enable row level security;

-- RLS Policies for authenticated users
-- Access is granted if the user owns the parent project

-- SELECT: Authenticated users can view decisions for their own projects
create policy "authenticated users can select own project decisions"
  on public.project_decisions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_decisions.project_id
        and projects.user_id = auth.uid()
    )
  );

-- INSERT: Authenticated users can create decisions for their own projects
create policy "authenticated users can insert own project decisions"
  on public.project_decisions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_decisions.project_id
        and projects.user_id = auth.uid()
    )
  );

-- UPDATE: Authenticated users can update decisions for their own projects
create policy "authenticated users can update own project decisions"
  on public.project_decisions
  for update
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_decisions.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_decisions.project_id
        and projects.user_id = auth.uid()
    )
  );

-- DELETE: Authenticated users can delete decisions for their own projects
create policy "authenticated users can delete own project decisions"
  on public.project_decisions
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_decisions.project_id
        and projects.user_id = auth.uid()
    )
  );

-- RLS Policies for anonymous users
-- Anonymous users have no access to project decisions

-- SELECT: Anonymous users cannot view any project decisions
create policy "anon users cannot select project decisions"
  on public.project_decisions
  for select
  to anon
  using (false);

-- INSERT: Anonymous users cannot create project decisions
create policy "anon users cannot insert project decisions"
  on public.project_decisions
  for insert
  to anon
  with check (false);

-- UPDATE: Anonymous users cannot update project decisions
create policy "anon users cannot update project decisions"
  on public.project_decisions
  for update
  to anon
  using (false)
  with check (false);

-- DELETE: Anonymous users cannot delete project decisions
create policy "anon users cannot delete project decisions"
  on public.project_decisions
  for delete
  to anon
  using (false);

-- Reuse the existing handle_updated_at trigger function from projects migration
-- Create trigger to automatically update the updated_at timestamp
create trigger on_project_decisions_updated
  before update on public.project_decisions
  for each row
  execute function public.handle_updated_at();

-- Create indexes for faster lookups
create index project_decisions_project_id_idx on public.project_decisions (project_id);
create index project_decisions_decision_id_idx on public.project_decisions (decision_id);

