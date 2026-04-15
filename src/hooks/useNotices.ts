import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiFetchNotices } from '../api/notices';
import type { Notice } from '../data/mockData';

export function useNotices(): Notice[] {
  const [data, setData] = useState<Notice[]>([]);

  useEffect(() => {
    apiFetchNotices().then(setData).catch(console.error);

    const channel = supabase
      .channel('hook-notices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
        apiFetchNotices().then(setData).catch(console.error);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return data;
}
