import { useSyncExternalStore } from 'react';
import { getTeams, subscribe } from '../data/hackathonStore';

export function useTeams() {
  return useSyncExternalStore(subscribe, getTeams);
}
