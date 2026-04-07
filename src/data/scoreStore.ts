import { scores as initialScores } from './mockData';
import type { Score } from './mockData';

// 평가 기준 (창의성 40 + 완성도 35 + 발표력 25 = 100점)
export const SCORE_CRITERIA = [
  { key: 'creativity'   as const, label: '창의성', max: 40 },
  { key: 'completion'   as const, label: '완성도', max: 35 },
  { key: 'presentation' as const, label: '발표력', max: 25 },
] as const;

// ── 모듈 레벨 싱글톤 스토어 ──────────────────────────────────
let _scores: Score[] = [...initialScores];
const listeners = new Set<() => void>();

export function getScores(): Score[] {
  return _scores;
}

export function updateScore(
  teamId: string,
  partial: { creativity: number; completion: number; presentation: number }
): void {
  const total = partial.creativity + partial.completion + partial.presentation;
  _scores = _scores.map((s) =>
    s.teamId === teamId ? { ...s, ...partial, total } : s
  );
  listeners.forEach((l) => l());
}

export function subscribeScores(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
