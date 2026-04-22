import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useMilestones } from '../hooks/useMilestones';
import { useAuth } from './useAuth';
import type { Milestone } from '../data/mockData';

const SCHEDULE_PATH = '/participant/schedule';

interface MilestonesNotificationCtx {
  hasNew: boolean;
}

const MilestonesNotificationContext = createContext<MilestonesNotificationCtx>({
  hasNew: false,
});

function computeFingerprint(ms: Milestone[]): string {
  return ms
    .filter((m) => m.isPublic)
    .map((m) => `${m.id}:${m.title}:${m.date}:${m.description ?? ''}`)
    .join('|');
}

export function MilestonesNotificationProvider({ children }: { children: ReactNode }) {
  const { data: milestones } = useMilestones();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const storageKey = `milestones_seen_${user?.id ?? ''}`;

  // Track seen fingerprint per storageKey (handles user login/logout)
  const [seenEntry, setSeenEntry] = useState<{ key: string; fp: string }>({
    key: storageKey,
    fp: localStorage.getItem(storageKey) ?? '',
  });

  // Derive hasNew in render — no useEffect needed for this
  const currentFp = milestones.length > 0 ? computeFingerprint(milestones) : null;
  const effectiveSeen = seenEntry.key === storageKey ? seenEntry.fp : (localStorage.getItem(storageKey) ?? '');
  const hasNew = currentFp !== null && currentFp !== effectiveSeen;

  // Mark as seen when visiting schedule page
  useEffect(() => {
    if (!pathname.startsWith(SCHEDULE_PATH) || currentFp === null) return;
    localStorage.setItem(storageKey, currentFp);
    // Responding to navigation — legitimate side effect that requires setState in effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeenEntry({ key: storageKey, fp: currentFp });
  }, [pathname, currentFp, storageKey]);

  return (
    <MilestonesNotificationContext.Provider value={{ hasNew }}>
      {children}
    </MilestonesNotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMilestonesNotification() {
  return useContext(MilestonesNotificationContext);
}
