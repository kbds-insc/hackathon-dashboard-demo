import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { participants, teams } from '../../data/mockData';
import { Search } from 'lucide-react';

type Tab = 'participants' | 'teams';
type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'approved', label: '승인' },
  { value: 'pending', label: '대기' },
  { value: 'rejected', label: '거절' },
];

export default function Participants() {
  const [tab, setTab] = useState<Tab>('participants');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const teamName = (teamId: string) => teams.find((t) => t.id === teamId)?.name ?? '-';

  const filtered = participants.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || p.name.includes(q) || p.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      {/* ── 탭 ── */}
      <div className="flex border-b border-gray-200 mb-5">
        {(['participants', 'teams'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'participants'
              ? `참가자 목록 (${participants.length})`
              : `팀 목록 (${teams.length})`}
          </button>
        ))}
      </div>

      {tab === 'participants' ? (
        <>
          {/* ── 필터 ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="이름 또는 이메일 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 데스크탑 테이블 ── */}
          <div className="hidden sm:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-400 font-medium uppercase tracking-wide">
                      <th className="pb-3 pr-4">이름</th>
                      <th className="pb-3 pr-4">이메일</th>
                      <th className="pb-3 pr-4">팀</th>
                      <th className="pb-3 pr-4">상태</th>
                      <th className="pb-3">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">{p.name}</td>
                        <td className="py-3 pr-4 text-gray-500">{p.email}</td>
                        <td className="py-3 pr-4 text-gray-500">{teamName(p.team)}</td>
                        <td className="py-3 pr-4">
                          <Badge status={p.status} />
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <ActionBtn label="승인" color="green" />
                            <ActionBtn label="거절" color="red" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-10">검색 결과가 없습니다.</p>
                )}
              </div>
            </Card>
          </div>

          {/* ── 모바일 카드 ── */}
          <div className="sm:hidden space-y-3">
            {filtered.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{p.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{teamName(p.team)}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <ActionBtn label="승인" color="green" className="flex-1" />
                  <ActionBtn label="거절" color="red" className="flex-1" />
                </div>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">검색 결과가 없습니다.</p>
            )}
          </div>
        </>
      ) : (
        /* ── 팀 카드 그리드 ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((team) => (
            <Card key={team.id}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{team.name}</h3>
                <Badge status={team.submitStatus} />
              </div>
              <p className="text-xs text-gray-400 mb-3">팀원 {team.members.length}명</p>
              <p className="text-sm text-gray-600 line-clamp-3">{team.idea}</p>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function ActionBtn({
  label,
  color,
  className = '',
}: {
  label: string;
  color: 'green' | 'red';
  className?: string;
}) {
  const colors = {
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
  };
  return (
    <button
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${colors[color]} ${className}`}
    >
      {label}
    </button>
  );
}
