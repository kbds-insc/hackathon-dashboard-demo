import { useState, useEffect } from 'react';
import { getAggregatedScores, subscribeScores } from '../data/scoreStore';
import type { AggregatedScore } from '../data/scoreStore';

export function useScores(): AggregatedScore[] {
  const [scores, setScores] = useState<AggregatedScore[]>(getAggregatedScores);
  useEffect(() => {
    return subscribeScores(() => setScores([...getAggregatedScores()]));
  }, []);
  return scores;
}
