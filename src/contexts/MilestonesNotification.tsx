import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useMilestones } from '../hooks/useMilestones';
import { useAuth } from './useAuth';
import type { Milestone } from '../data/mockData';

interface MilestonesNotificationCtx {
  milestones: Milestone[];
  hasNew: boolean;
  markAsSeen: () => void;
}

const MilestonesNotificationContext = createContext<MilestonesNotificationCtx>({
  milestones: [],
  hasNew: false,
  markAsSeen: () => {},
});

// 공개 마일스톤의 내용 변화 감지용 문자열
function computeFingerprint(ms: Milestone[]): string {
  return ms
    .filter((m) => m.isPublic)
    .map((m) => `${m.id}:${m.title}:${m.date}:${m.description ?? ''}`)
    .join('|');
}

export function MilestonesNotificationProvider({ children }: { children: ReactNode }) {
  const { data: milestones } = useMilestones();
  const { user } = useAuth();
  const storageKey = `milestones_seen_${user?.id ?? ''}`;
  const [hasNew, setHasNew] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    // 첫 fetch 전 빈 배열일 때는 무시
    if (milestones.length === 0 && !loadedRef.current) return;
    loadedRef.current = true;
    const current = computeFingerprint(milestones);
    const seen = localStorage.getItem(storageKey) ?? '';
    setHasNew(current !== seen);
  }, [milestones, storageKey]);

  const markAsSeen = useCallback(() => {
    localStorage.setItem(storageKey, computeFingerprint(milestones));
    setHasNew(false);
  }, [milestones, storageKey]);

  return (
    <MilestonesNotificationContext.Provider value={{ milestones, hasNew, markAsSeen }}>
      {children}
    </MilestonesNotificationContext.Provider>
  );
}

export function useMilestonesNotification() {
  return useContext(MilestonesNotificationContext);
}
