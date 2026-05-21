import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiFetchSettings, DEFAULT_SETTINGS } from '../api/settings';
import type { Settings } from '../api/settings';

let channelCounter = 0;

export interface SettingsResult {
  settings: Settings;
  loaded: boolean;
}

export function useSettings(): SettingsResult {
  const [data, setData] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetchSettings().then((s) => { setData(s); setLoaded(true); }).catch(console.error);

    const ch = supabase
      .channel(`hook-settings-${++channelCounter}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        apiFetchSettings().then(setData).catch(console.error);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  return { settings: data, loaded };
}
