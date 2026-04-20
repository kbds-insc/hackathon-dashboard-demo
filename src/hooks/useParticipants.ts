import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { apiFetchParticipants } from '../api/participants';
import type { Participant } from '../data/mockData';

export interface UseParticipantsResult {
  data: Participant[];
  refetch: () => Promise<Participant[]>;
  upsertLocal: (participant: Participant) => void;
}

export function useParticipants(): UseParticipantsResult {
  const [data, setData] = useState<Participant[]>([]);

  const refetch = useCallback(async () => {
    const next = await apiFetchParticipants();
    setData(next);
    return next;
  }, []);

  const upsertLocal = useCallback((participant: Participant) => {
    setData((prev) => {
      const exists = prev.some((item) => item.id === participant.id);
      return exists
        ? prev.map((item) => (item.id === participant.id ? participant : item))
        : [...prev, participant];
    });
  }, []);

  useEffect(() => {
    refetch().catch(console.error);

    const channel = supabase
      .channel('hook-participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        refetch().catch(console.error);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return { data, refetch, upsertLocal };
}
