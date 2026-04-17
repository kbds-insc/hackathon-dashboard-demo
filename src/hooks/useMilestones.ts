import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { apiFetchMilestones } from '../api/milestones';
import type { Milestone } from '../data/mockData';

export function useMilestones() {
  const [data, setData] = useState<Milestone[]>([]);

  const load = useCallback(() => {
    apiFetchMilestones().then(setData).catch(console.error);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('hook-milestones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { data, refetch: load };
}
