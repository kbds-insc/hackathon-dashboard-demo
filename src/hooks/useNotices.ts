import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { apiFetchNotices } from '../api/notices';
import type { Notice } from '../data/mockData';

let instanceCounter = 0;

export function useNotices(opts?: { publicOnly?: boolean }) {
  const [data, setData] = useState<Notice[]>([]);
  const channelName = useRef(`hook-notices-${++instanceCounter}`);
  const publicOnly = opts?.publicOnly ?? false;

  const load = useCallback(() => {
    apiFetchNotices({ publicOnly }).then(setData).catch(console.error);
  }, [publicOnly]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(channelName.current)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { data, refetch: load };
}
