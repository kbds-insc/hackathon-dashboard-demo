import { useState, useEffect } from 'react';
import { getScores, subscribeScores } from '../data/scoreStore';
import type { Score } from '../data/mockData';

export function useScores(): Score[] {
  const [scores, setScores] = useState<Score[]>(getScores);

  useEffect(() => {
    return subscribeScores(() => setScores([...getScores()]));
  }, []);

  return scores;
}
