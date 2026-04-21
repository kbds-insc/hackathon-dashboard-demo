import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotices } from '../hooks/useNotices';
import { useAuth } from './useAuth';

const NOTICES_PATH = '/participant/notices';

interface NoticesNotificationCtx {
  hasNew: boolean;
}

const NoticesNotificationContext = createContext<NoticesNotificationCtx>({
  hasNew: false,
});

function getSeenIds(storageKey: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  } catch {
    return [];
  }
}

export function NoticesNotificationProvider({ children }: { children: ReactNode }) {
  const { data: notices } = useNotices();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const storageKey = `notices_seen_ids_${user?.id ?? ''}`;

  // Track seen IDs per storageKey (handles user login/logout)
  const [seenEntry, setSeenEntry] = useState<{ key: string; ids: string[] }>({
    key: storageKey,
    ids: getSeenIds(storageKey),
  });

  // Derive hasNew in render — no useEffect needed for this
  const effectiveIds = seenEntry.key === storageKey ? seenEntry.ids : getSeenIds(storageKey);
  const hasNew = notices.length > 0 && notices.some((n) => !effectiveIds.includes(n.id));

  // Mark as seen when visiting notices page
  useEffect(() => {
    if (!pathname.startsWith(NOTICES_PATH) || notices.length === 0) return;
    const ids = notices.map((n) => n.id);
    localStorage.setItem(storageKey, JSON.stringify(ids));
    // Responding to navigation — legitimate side effect that requires setState in effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeenEntry({ key: storageKey, ids });
  }, [pathname, notices, storageKey]);

  return (
    <NoticesNotificationContext.Provider value={{ hasNew }}>
      {children}
    </NoticesNotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNoticesNotification() {
  return useContext(NoticesNotificationContext);
}
