import { scores as initialScores } from './mockData';
import type { Score } from './mockData';
import { getTeams } from './hackathonStore';

// 평가 기준 (창의성 40 + 완성도 35 + 발표력 25 = 100점)
export const SCORE_CRITERIA = [
  { key: 'creativity'   as const, label: '창의성', max: 40 },
  { key: 'completion'   as const, label: '완성도', max: 35 },
  { key: 'presentation' as const, label: '발표력', max: 25 },
] as const;

// ── 모듈 레벨 싱글톤 스토어 ──────────────────────────────────
let _scores: Score[] = [...initialScores];
const listeners = new Set<() => void>();

// hackathonStore의 팀 목록 기준으로 없는 팀은 기본값으로 보완해서 반환
export function getScores(): Score[] {
  const teams = getTeams();
  const result: Score[] = teams.map((team) => {
    const existing = _scores.find((s) => s.teamId === team.id);
    if (existing) return existing;
    return { teamId: team.id, creativity: 0, completion: 0, presentation: 0, total: 0 };
  });
  return result;
}

export function updateScore(
  teamId: string,
  partial: { creativity: number; completion: number; presentation: number }
): void {
  const total = partial.creativity + partial.completion + partial.presentation;
  const exists = _scores.some((s) => s.teamId === teamId);
  if (exists) {
    _scores = _scores.map((s) =>
      s.teamId === teamId ? { ...s, ...partial, total } : s
    );
  } else {
    _scores = [..._scores, { teamId, ...partial, total }];
  }
  listeners.forEach((l) => l());
}

export function subscribeScores(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
