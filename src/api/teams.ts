import { supabase } from '../lib/supabase';

export interface TeamRow {
  id: string;
  name: string;
  idea: string;
  submit_status: 'submitted' | 'not-submitted';
  locked: boolean;
}

export async function apiFetchTeams(): Promise<TeamRow[]> {
  const [{ data, error }, { data: subsData }] = await Promise.all([
    supabase.from('teams').select('*').order('created_at', { ascending: true }),
    supabase.from('submissions').select('team_id'),
  ]);
  if (error) throw error;
  const submittedIds = new Set((subsData ?? []).map((s: { team_id: string }) => s.team_id));
  return (data ?? []).map((t) => ({
    ...(t as TeamRow),
    submit_status: submittedIds.has((t as TeamRow).id) ? 'submitted' : 'not-submitted',
  }));
}

export async function apiAddTeam(data: { name: string; idea: string }): Promise<TeamRow> {
  const { data: row, error } = await supabase
    .from('teams')
    .insert({ name: data.name, idea: data.idea, submit_status: 'not-submitted', locked: false })
    .select()
    .single();
  if (error) throw error;
  return row as TeamRow;
}

export async function apiUpdateTeam(
  id: string,
  patch: Partial<{ name: string; idea: string; submit_status: string; locked: boolean }>
): Promise<void> {
  const { error } = await supabase.from('teams').update(patch).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteTeam(id: string): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', id);
  if (error) throw error;
}

export async function apiFetchTeamById(id: string): Promise<TeamRow | null> {
  const [{ data, error }, { data: subData }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', id).single(),
    supabase.from('submissions').select('team_id').eq('team_id', id).maybeSingle(),
  ]);
  if (error) return null;
  return {
    ...(data as TeamRow),
    submit_status: subData ? 'submitted' : 'not-submitted',
  };
}
