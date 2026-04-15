import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import { useTeams } from '../../hooks/useTeams';
import { useJudgeScores } from '../../hooks/useJudgeScores';
import {
  SCORE_CRITERIA,
  MOCK_JUDGES,
  updateScore,
  getScoresByJudge,
} from '../../data/scoreStore';
import { ArrowLeft, Save, CheckCircle2, User } from 'lucide-react';

type TeamDraft = { creativity: number; completion: number; presentation: number };
type DraftScores = Record<string, TeamDraft>;
// 심사위원별 draft를 하나의 Record에 저장 (useEffect 없이 judge 전환 시 독립 유지)
type AllDrafts = Record<string, DraftScores>;
type AllSaved = Record<string, Set<string>>;

function buildDraft(judgeId: string): DraftScores {
  return Object.fromEntries(
    getScoresByJudge(judgeId).map((s) => [
      s.teamId,
      { creativity: s.creativity, completion: s.completion, presentation: s.presentation },
    ])
  );
}

export default function ScoreInput() {
  const teams = useTeams();

  // ── 임시 심사위원 선택 (Phase 2에서 AuthContext로 교체) ──────
  const [currentJudgeId, setCurrentJudgeId] = useState(MOCK_JUDGES[0].id);
  const currentJudge = MOCK_JUDGES.find((j) => j.id === currentJudgeId)!;

  const judgeScores = useJudgeScores(currentJudgeId);

  // 심사위원별 draft/saved를 하나의 Record에 저장 → useEffect 불필요
  const [allDrafts, setAllDrafts] = useState<AllDrafts>(() => ({
    [MOCK_JUDGES[0].id]: buildDraft(MOCK_JUDGES[0].id),
  }));
  const [allSaved, setAllSaved] = useState<AllSaved>({});

  const draft = allDrafts[currentJudgeId] ?? buildDraft(currentJudgeId);
  const saved = allSaved[currentJudgeId] ?? new Set<string>();

  const setField = (
    teamId: string,
    field: 'creativity' | 'completion' | 'presentation',
    raw: string
  ) => {
    const max = SCORE_CRITERIA.find((c) => c.key === field)!.max;
    const val = Math.min(max, Math.max(0, Number(raw) || 0));
    setAllDrafts((prev) => {
      const cur = prev[currentJudgeId] ?? buildDraft(currentJudgeId);
      return {
        ...prev,
        [currentJudgeId]: {
          ...cur,
          [teamId]: { ...(cur[teamId] ?? { creativity: 0, completion: 0, presentation: 0 }), [field]: val },
        },
      };
    });
    setAllSaved((prev) => {
      const next = new Set(prev[currentJudgeId] ?? []);
      next.delete(teamId);
      return { ...prev, [currentJudgeId]: next };
    });
  };

  const handleSave = (teamId: string) => {
    const d = draft[teamId] ?? { creativity: 0, completion: 0, presentation: 0 };
    updateScore(currentJudgeId, currentJudge.name, teamId, d);
    setAllSaved((prev) => {
      const next = new Set(prev[currentJudgeId] ?? []);
      next.add(teamId);
      return { ...prev, [currentJudgeId]: next };
    });
  };

  const handleSaveAll = () => {
    teams.forEach((t) => {
      const d = draft[t.id] ?? { creativity: 0, completion: 0, presentation: 0 };
      updateScore(currentJudgeId, currentJudge.name, t.id, d);
    });
    setAllSaved((prev) => ({
      ...prev,
      [currentJudgeId]: new Set(teams.map((t) => t.id)),
    }));
  };

  const getTotal = (teamId: string) => {
    const d = draft[teamId] ?? { creativity: 0, completion: 0, presentation: 0 };
    return d.creativity + d.completion + d.presentation;
  };

  const isChanged = (teamId: string) => {
    const original = judgeScores.find((s) => s.teamId === teamId);
    if (!original) return true;
    const d = draft[teamId] ?? { creativity: 0, completion: 0, presentation: 0 };
    return (
      d.creativity !== original.creativity ||
      d.completion !== original.completion ||
      d.presentation !== original.presentation
    );
  };

  return (
    <AdminLayout>
      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/scores"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            점수판으로
          </Link>
          <span className="text-gray-300">/</span>
          <h2 className="text-base font-semibold text-gray-800">점수 입력</h2>
        </div>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#80766b] text-white text-sm font-medium rounded-lg hover:bg-[#6e645a] transition-colors"
        >
          <Save className="w-4 h-4" />
          전체 저장
        </button>
      </div>

      {/* ── 심사위원 선택 (임시 — Phase 2에서 로그인으로 교체) ── */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">심사위원 선택</span>
          <span className="text-xs text-amber-500 ml-auto">* 로그인 구현 후 자동 식별로 교체됩니다</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {MOCK_JUDGES.map((judge) => (
            <button
              key={judge.id}
              onClick={() => setCurrentJudgeId(judge.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentJudgeId === judge.id
                  ? 'bg-[#80766b] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {judge.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 평가 기준 안내 ── */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {SCORE_CRITERIA.map((c) => (
          <div key={c.key} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-lg font-bold text-gray-700">{c.max}점</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ── 데스크탑 테이블 입력 ── */}
      <div className="hidden sm:block mb-6">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium uppercase tracking-wide">
                  <th className="pb-3 pr-4 text-left">팀명</th>
                  {SCORE_CRITERIA.map((c) => (
                    <th key={c.key} className="pb-3 pr-4 text-center">
                      {c.label}
                      <span className="text-gray-300 font-normal ml-1">/ {c.max}</span>
                    </th>
                  ))}
                  <th className="pb-3 pr-4 text-center">합계</th>
                  <th className="pb-3 text-center">저장</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teams.map((team) => {
                  const d = draft[team.id] ?? { creativity: 0, completion: 0, presentation: 0 };
                  const total = getTotal(team.id);
                  const isSaved = saved.has(team.id);
                  const changed = isChanged(team.id);
                  return (
                    <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 pr-4 font-medium text-gray-800">{team.name}</td>
                      {SCORE_CRITERIA.map((c) => (
                        <td key={c.key} className="py-3.5 pr-4">
                          <input
                            type="number"
                            min={0}
                            max={c.max}
                            value={d[c.key]}
                            onChange={(e) => setField(team.id, c.key, e.target.value)}
                            className="w-20 px-2 py-1.5 text-center text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80766b]/30"
                          />
                        </td>
                      ))}
                      <td className="py-3.5 pr-4 text-center">
                        <span className={`font-bold text-base ${total === 0 ? 'text-gray-300' : 'text-gray-800'}`}>
                          {total}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        {isSaved && !changed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            저장됨
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSave(team.id)}
                            disabled={!changed}
                            className="px-3 py-1.5 text-xs font-medium bg-[#80766b] text-white rounded-lg hover:bg-[#6e645a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            저장
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── 모바일 카드 입력 ── */}
      <div className="sm:hidden space-y-4">
        {teams.map((team) => {
          const d = draft[team.id] ?? { creativity: 0, completion: 0, presentation: 0 };
          const total = getTotal(team.id);
          const isSaved = saved.has(team.id);
          const changed = isChanged(team.id);
          return (
            <Card key={team.id}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{team.name}</h3>
                <span className={`text-2xl font-bold ${total === 0 ? 'text-gray-200' : 'text-gray-800'}`}>
                  {total}<span className="text-sm font-normal text-gray-400">점</span>
                </span>
              </div>
              <div className="space-y-3">
                {SCORE_CRITERIA.map((c) => (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-14 shrink-0">{c.label}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={c.max}
                        value={d[c.key]}
                        onChange={(e) => setField(team.id, c.key, e.target.value)}
                        className="w-20 px-3 py-2 text-center text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80766b]/30"
                      />
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#80766b] rounded-full transition-all"
                          style={{ width: `${Math.min((d[c.key] / c.max) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">/ {c.max}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                {isSaved && !changed ? (
                  <div className="flex items-center justify-center gap-1.5 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    저장 완료
                  </div>
                ) : (
                  <button
                    onClick={() => handleSave(team.id)}
                    disabled={!changed}
                    className="w-full py-2 text-sm font-medium bg-[#80766b] text-white rounded-lg hover:bg-[#6e645a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    저장하기
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
