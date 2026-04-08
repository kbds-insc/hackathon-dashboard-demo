import { useSyncExternalStore } from 'react';
import { getParticipants, subscribe } from '../data/hackathonStore';

export function useParticipants() {
  return useSyncExternalStore(subscribe, getParticipants);
}
