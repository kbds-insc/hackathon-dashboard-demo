import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import { teams, scores } from '../../data/mockData';
import { Trophy } from 'lucide-react';

const CRITERIA = [
  { label: '창의성', points: 30, textColor: 'text-purple-600', bg: 'bg-purple-50' },
  { label: '완성도', points: 40, textColor: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '발표력', points: 30, textColor: 'text-green-600', bg: 'bg-green-50' },
] as const;

const MAX_SCORE = 100;

export default function Scoring() {
  const ranked = [...scores]
    .sort((a, b) => b.total - a.total)
    .map((s, idx) => ({
      ...s,
      rank: s.total > 0 ? idx + 1 : null,
      team: teams.find((t) => t.id === s.teamId)!,
    }));

  return (
    <AdminLayout>
      {/* ── 평가 항목 안내 ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {CRITERIA.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-xl p-3 sm:p-5 text-center`}>
            <p className={`text-2xl sm:text-3xl font-bold ${c.textColor}`}>{c.points}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {c.label} <span className="hidden sm:inline">점</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── 데스크탑 테이블 ── */}
      <div className="hidden sm:block mb-6">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium uppercase tracking-wide">
                  <th className="pb-3 pr-4 text-left w-14">순위</th>
                  <th className="pb-3 pr-4 text-left">팀명</th>
                  <th className="pb-3 pr-4 text-right text-purple-500">창의성</th>
                  <th className="pb-3 pr-4 text-right text-blue-500">완성도</th>
                  <th className="pb-3 pr-4 text-right text-green-500">발표력</th>
                  <th className="pb-3 text-right text-gray-600">합계</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ranked.map((row) => {
                  const isFirst = row.rank === 1;
                  return (
                    <tr
                      key={row.teamId}
                      className={`transition-colors ${
                        isFirst ? 'bg-yellow-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3.5 pr-4">
                        {isFirst ? (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        ) : row.rank ? (
                          <span className="text-gray-500 font-medium">{row.rank}위</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-gray-800">{row.team.name}</td>
                      <td className="py-3.5 pr-4 text-right text-purple-600 font-medium">
                        {row.creativity || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3.5 pr-4 text-right text-blue-600 font-medium">
                        {row.completion || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3.5 pr-4 text-right text-green-600 font-medium">
                        {row.presentation || <span className="text-gray-300">-</span>}
                      </td>
                      <td
                        className={`py-3.5 text-right font-bold text-base ${
                          isFirst ? 'text-yellow-600' : 'text-gray-800'
                        }`}
                      >
                        {row.total || <span className="text-gray-300 font-normal text-sm">미제출</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── 모바일 점수 카드 ── */}
      <div className="sm:hidden space-y-3 mb-6">
        {ranked.map((row) => {
          const isFirst = row.rank === 1;
          return (
            <div
              key={row.teamId}
              className={`rounded-xl border p-4 ${
                isFirst
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isFirst && <Trophy className="w-4 h-4 text-yellow-500" />}
                  <span className="font-semibold text-gray-800">{row.team.name}</span>
                  {row.rank && !isFirst && (
                    <span className="text-xs text-gray-400">{row.rank}위</span>
                  )}
                </div>
                <span
                  className={`text-2xl font-bold ${
                    isFirst ? 'text-yellow-600' : row.total > 0 ? 'text-gray-800' : 'text-gray-300'
                  }`}
                >
                  {row.total > 0 ? row.total : '-'}
                </span>
              </div>
              {row.total > 0 ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-purple-50 rounded-lg py-2">
                    <p className="text-purple-600 font-bold text-lg">{row.creativity}</p>
                    <p className="text-gray-400 text-xs mt-0.5">창의성</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg py-2">
                    <p className="text-blue-600 font-bold text-lg">{row.completion}</p>
                    <p className="text-gray-400 text-xs mt-0.5">완성도</p>
                  </div>
                  <div className="bg-green-50 rounded-lg py-2">
                    <p className="text-green-600 font-bold text-lg">{row.presentation}</p>
                    <p className="text-gray-400 text-xs mt-0.5">발표력</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">미제출 — 점수 없음</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 팀별 점수 막대 차트 ── */}
      <Card title="팀별 합계 점수 비교">
        <div className="space-y-4">
          {ranked.map((row) => {
            const isFirst = row.rank === 1;
            const pct = Math.round((row.total / MAX_SCORE) * 100);
            return (
              <div key={row.teamId}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <div className="flex items-center gap-1.5">
                    {isFirst && <Trophy className="w-3.5 h-3.5 text-yellow-500" />}
                    <span className="font-medium text-gray-700">{row.team.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {row.total > 0 ? `${row.total} / ${MAX_SCORE}점` : '미제출'}
                  </span>
                </div>
                <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg flex items-center justify-end pr-2.5 text-xs font-semibold text-white transition-all duration-700 ${
                      isFirst ? 'bg-yellow-400' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  >
                    {pct > 20 && `${row.total}점`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-right">
          만점 기준: 창의성 30 + 완성도 40 + 발표력 30 = 100점
        </p>
      </Card>
    </AdminLayout>
  );
}
