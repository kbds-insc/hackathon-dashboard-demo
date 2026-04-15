import { getTeams } from './hackathonStore';

// ── 평가 기준 ─────────────────────────────────────────────────
export const SCORE_CRITERIA = [
  { key: 'creativity'   as const, label: '창의성', max: 40 },
  { key: 'completion'   as const, label: '완성도', max: 35 },
  { key: 'presentation' as const, label: '발표력', max: 25 },
] as const;

// ── 타입 정의 ─────────────────────────────────────────────────

export interface Judge {
  id: string;
  name: string;
}

/** 심사위원 1명의 특정 팀에 대한 점수 */
export interface JudgeScore {
  judgeId: string;
  judgeName: string;
  teamId: string;
  creativity: number;
  completion: number;
  presentation: number;
}

/** 전체 심사위원 점수를 팀별로 평균 집계한 결과 */
export interface AggregatedScore {
  teamId: string;
  creativity: number;   // 평균 (반올림)
  completion: number;
  presentation: number;
  total: number;
  judgeCount: number;   // 해당 팀에 점수를 입력한 심사위원 수
}

// ── 목업 심사위원 (Phase 2에서 Supabase Auth로 교체) ─────────
export const MOCK_JUDGES: Judge[] = [
  { id: 'j1', name: '김철수' },
  { id: 'j2', name: '이영희' },
  { id: 'j3', name: '박민수' },
];

// ── 초기 목업 점수 데이터 ────────────────────────────────────
let _judgeScores: JudgeScore[] = [
  // 김철수 — 전 팀 입력
  { judgeId: 'j1', judgeName: '김철수', teamId: 't1', creativity: 36, completion: 30, presentation: 22 },
  { judgeId: 'j1', judgeName: '김철수', teamId: 't2', creativity: 38, completion: 32, presentation: 22 },
  { judgeId: 'j1', judgeName: '김철수', teamId: 't3', creativity: 30, completion: 28, presentation: 21 },
  { judgeId: 'j1', judgeName: '김철수', teamId: 't4', creativity: 28, completion: 26, presentation: 18 },
  // 이영희 — 전 팀 입력
  { judgeId: 'j2', judgeName: '이영희', teamId: 't1', creativity: 34, completion: 31, presentation: 20 },
  { judgeId: 'j2', judgeName: '이영희', teamId: 't2', creativity: 37, completion: 30, presentation: 23 },
  { judgeId: 'j2', judgeName: '이영희', teamId: 't3', creativity: 32, completion: 29, presentation: 22 },
  { judgeId: 'j2', judgeName: '이영희', teamId: 't4', creativity: 26, completion: 24, presentation: 17 },
  // 박민수 — t1, t2만 입력 (미완료 케이스 시뮬레이션)
  { judgeId: 'j3', judgeName: '박민수', teamId: 't1', creativity: 35, completion: 33, presentation: 21 },
  { judgeId: 'j3', judgeName: '박민수', teamId: 't2', creativity: 39, completion: 31, presentation: 22 },
];

const listeners = new Set<() => void>();

// ── getters ───────────────────────────────────────────────────

export function getJudges(): Judge[] {
  return MOCK_JUDGES;
}

/** 특정 심사위원의 점수 목록 — 미입력 팀은 0으로 채움 */
export function getScoresByJudge(judgeId: string): JudgeScore[] {
  const teams = getTeams();
  const judge = MOCK_JUDGES.find((j) => j.id === judgeId);
  return teams.map((team) => {
    const existing = _judgeScores.find(
      (s) => s.judgeId === judgeId && s.teamId === team.id
    );
    if (existing) return existing;
    return {
      judgeId,
      judgeName: judge?.name ?? '',
      teamId: team.id,
      creativity: 0,
      completion: 0,
      presentation: 0,
    };
  });
}

/** 전체 심사위원 점수를 팀별 평균으로 집계 */
export function getAggregatedScores(): AggregatedScore[] {
  const teams = getTeams();
  return teams.map((team) => {
    // 해당 팀에 점수를 입력한 심사위원만 (0점 전부인 경우 제외)
    const entered = _judgeScores.filter(
      (s) =>
        s.teamId === team.id &&
        (s.creativity > 0 || s.completion > 0 || s.presentation > 0)
    );
    if (entered.length === 0) {
      return { teamId: team.id, creativity: 0, completion: 0, presentation: 0, total: 0, judgeCount: 0 };
    }
    const avg = (key: keyof Pick<JudgeScore, 'creativity' | 'completion' | 'presentation'>) =>
      Math.round(entered.reduce((sum, s) => sum + s[key], 0) / entered.length);

    const creativity = avg('creativity');
    const completion = avg('completion');
    const presentation = avg('presentation');
    return {
      teamId: team.id,
      creativity,
      completion,
      presentation,
      total: creativity + completion + presentation,
      judgeCount: entered.length,
    };
  });
}

/** 모든 심사위원의 원본 점수 (Scoring 상세 보기용) */
export function getAllJudgeScores(): JudgeScore[] {
  return _judgeScores;
}

// ── 업데이트 ──────────────────────────────────────────────────

export function updateScore(
  judgeId: string,
  judgeName: string,
  teamId: string,
  partial: { creativity: number; completion: number; presentation: number }
): void {
  const exists = _judgeScores.some(
    (s) => s.judgeId === judgeId && s.teamId === teamId
  );
  if (exists) {
    _judgeScores = _judgeScores.map((s) =>
      s.judgeId === judgeId && s.teamId === teamId ? { ...s, ...partial } : s
    );
  } else {
    _judgeScores = [..._judgeScores, { judgeId, judgeName, teamId, ...partial }];
  }
  listeners.forEach((l) => l());
}

export function subscribeScores(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Legacy alias
export function getScores(): AggregatedScore[] {
  return getAggregatedScores();
}
