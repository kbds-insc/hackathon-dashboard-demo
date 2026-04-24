import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const INTERVAL_MS = 4 * 60 * 1000; // 4분

export function useSupabaseKeepalive() {
  useEffect(() => {
    const ping = () => {
      supabase.from('participants').select('id').limit(1).then(() => {});
    };

    ping(); // 마운트 시 즉시 1회
    const id = setInterval(ping, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
