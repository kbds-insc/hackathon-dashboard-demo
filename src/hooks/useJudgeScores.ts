import { useSyncExternalStore } from 'react';
import { getScoresByJudge, subscribeScores } from '../data/scoreStore';
import type { JudgeScore } from '../data/scoreStore';

export function useJudgeScores(judgeId: string): JudgeScore[] {
  return useSyncExternalStore(
    subscribeScores,
    () => getScoresByJudge(judgeId)
  );
}
