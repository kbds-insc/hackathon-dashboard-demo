import { participants as initialParticipants, teams as initialTeams } from './mockData';
import type { Participant } from './mockData';

// ── 확장된 Team 타입 ──────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  members: string[];       // participant ids
  idea: string;
  submitStatus: 'submitted' | 'not-submitted';
  score: number | null;
  locked: boolean;
}

// ── autoMatch 옵션 ────────────────────────────────────────────
export interface AutoMatchOptions {
  teamSize: number;
  spreadDepartment: boolean;
  spreadPosition: boolean;
  limitLeader: boolean;
}

export interface AutoMatchResult {
  matched: number;
  unmatched: number;
}

// 리더급 직급
const LEADER_POSITIONS = ['과장', '차장', '부장', '팀장', '수석'];

// ── 모듈 레벨 싱글톤 ─────────────────────────────────────────
let _participants: Participant[] = initialParticipants.map((p) => ({ ...p }));
let _teams: Team[] = initialTeams.map((t) => ({ ...t, locked: false }));

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// ── 팀 members 재계산 (participants.team 기준) ────────────────
function recalcMembers() {
  _teams = _teams.map((team) => ({
    ...team,
    members: _participants.filter((p) => p.team === team.id).map((p) => p.id),
  }));
}

// 초기 동기화
recalcMembers();

// ── getters ───────────────────────────────────────────────────
export function getParticipants(): Participant[] {
  return _participants;
}

export function getTeams(): Team[] {
  return _teams;
}

// ── subscribe ─────────────────────────────────────────────────
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ── addParticipant ────────────────────────────────────────────
export function addParticipant(data: Omit<Participant, 'id'>): void {
  const newP: Participant = {
    id: `p${Date.now()}`,
    ...data,
  };
  _participants = [..._participants, newP];
  recalcMembers();
  notify();
}

// ── updateParticipant ─────────────────────────────────────────
export function updateParticipant(
  id: string,
  partial: Partial<Omit<Participant, 'id'>>
): boolean {
  const current = _participants.find((p) => p.id === id);
  if (!current) return false;

  // 현재 팀이 잠겨있으면 팀 변경 불가
  if (partial.team !== undefined && partial.team !== current.team) {
    const currentTeam = _teams.find((t) => t.id === current.team);
    if (currentTeam?.locked) return false;
  }

  _participants = _participants.map((p) =>
    p.id === id ? { ...p, ...partial } : p
  );
  recalcMembers();
  notify();
  return true;
}

// ── deleteParticipant ─────────────────────────────────────────
export function deleteParticipant(id: string): boolean {
  const p = _participants.find((pp) => pp.id === id);
  if (!p) return false;

  // 잠긴 팀 소속이면 삭제 불가
  const team = _teams.find((t) => t.id === p.team);
  if (team?.locked) return false;

  _participants = _participants.filter((pp) => pp.id !== id);
  recalcMembers();
  notify();
  return true;
}

// ── addTeam ───────────────────────────────────────────────────
export function addTeam(data: Pick<Team, 'name' | 'idea'>): void {
  const newTeam: Team = {
    id: `t${Date.now()}`,
    name: data.name,
    idea: data.idea,
    members: [],
    submitStatus: 'not-submitted',
    score: null,
    locked: false,
  };
  _teams = [..._teams, newTeam];
  notify();
}

// ── updateTeam ────────────────────────────────────────────────
export function updateTeam(id: string, partial: Partial<Omit<Team, 'id' | 'members'>>): boolean {
  const team = _teams.find((t) => t.id === id);
  if (!team) return false;
  if (team.locked) return false;

  _teams = _teams.map((t) =>
    t.id === id ? { ...t, ...partial } : t
  );
  notify();
  return true;
}

// ── deleteTeam ────────────────────────────────────────────────
export function deleteTeam(id: string): boolean {
  const team = _teams.find((t) => t.id === id);
  if (!team) return false;
  if (team.locked) throw new Error('잠긴 팀은 삭제할 수 없습니다.');

  // 소속 참가자의 team을 '' 로 초기화
  _participants = _participants.map((p) =>
    p.team === id ? { ...p, team: '' } : p
  );
  _teams = _teams.filter((t) => t.id !== id);
  notify();
  return true;
}

// ── toggleTeamLock ────────────────────────────────────────────
export function toggleTeamLock(id: string): void {
  _teams = _teams.map((t) =>
    t.id === id ? { ...t, locked: !t.locked } : t
  );
  notify();
}

// ── autoMatch ─────────────────────────────────────────────────
export function autoMatch(options: AutoMatchOptions): AutoMatchResult {
  const { teamSize, spreadDepartment, spreadPosition, limitLeader } = options;

  // 대상 참가자: approved + team === ''
  const candidates = _participants.filter(
    (p) => p.status === 'approved' && p.team === ''
  );

  if (candidates.length === 0) {
    return { matched: 0, unmatched: 0 };
  }

  // 배정 가능한 팀 (잠금 해제)
  const availableTeams = _teams.filter((t) => !t.locked);

  if (availableTeams.length === 0) {
    return { matched: 0, unmatched: candidates.length };
  }

  // 현재 각 팀에 배정된 인원 추적 (임시)
  const teamAssignments: Map<string, Participant[]> = new Map();
  for (const team of availableTeams) {
    const currentMembers = _participants.filter(
      (p) => p.team === team.id && p.status === 'approved'
    );
    teamAssignments.set(team.id, [...currentMembers]);
  }

  // 후보를 섞어서 다양성 확보
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  const assigned: { participantId: string; teamId: string }[] = [];

  for (const candidate of shuffled) {
    // 후보를 배정할 팀 찾기
    let bestTeamId: string | null = null;
    let bestScore = -Infinity;

    for (const team of availableTeams) {
      const currentAssigned = teamAssignments.get(team.id) ?? [];

      // 팀 크기 초과 체크
      if (currentAssigned.length >= teamSize) continue;

      // 리더급 제한 체크
      const isLeader = LEADER_POSITIONS.some((pos) =>
        candidate.position.includes(pos)
      );
      if (limitLeader && isLeader) {
        const teamLeaderCount = currentAssigned.filter((p) =>
          LEADER_POSITIONS.some((pos) => p.position.includes(pos))
        ).length;
        if (teamLeaderCount >= 1) continue;
      }

      // 점수 계산 (낮을수록 좋은 팀)
      let score = 0;

      // 부서 분산: 같은 부서 멤버가 적을수록 좋음
      if (spreadDepartment) {
        const sameDeptCount = currentAssigned.filter(
          (p) => p.department === candidate.department
        ).length;
        score -= sameDeptCount * 10;
      }

      // 직급 분산: 같은 직급 멤버가 적을수록 좋음
      if (spreadPosition) {
        const samePosCount = currentAssigned.filter(
          (p) => p.position === candidate.position
        ).length;
        score -= samePosCount * 5;
      }

      // 팀 인원 적을수록 우선 (균등 배분)
      score -= currentAssigned.length * 2;

      if (score > bestScore) {
        bestScore = score;
        bestTeamId = team.id;
      }
    }

    if (bestTeamId !== null) {
      assigned.push({ participantId: candidate.id, teamId: bestTeamId });
      const arr = teamAssignments.get(bestTeamId) ?? [];
      arr.push(candidate);
      teamAssignments.set(bestTeamId, arr);
    }
  }

  // 실제 상태에 반영
  for (const { participantId, teamId } of assigned) {
    const p = _participants.find((pp) => pp.id === participantId);
    if (p) {
      _participants = _participants.map((pp) =>
        pp.id === participantId ? { ...pp, team: teamId } : pp
      );
    }
  }

  recalcMembers();
  notify();

  const matched = assigned.length;
  const unmatched = candidates.length - matched;

  return { matched, unmatched };
}
