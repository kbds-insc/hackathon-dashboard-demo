import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { participants, teams, notices, scores } from '../../data/mockData';
import { Users, Flag, FileCheck, Trophy } from 'lucide-react';

export default function Dashboard() {
  const submittedCount = teams.filter((t) => t.submitStatus === 'submitted').length;
  const scoredCount = scores.filter((s) => s.total > 0).length;
  const recentNotices = [...notices].reverse().slice(0, 3);

  return (
    <AdminLayout>
      {/* ── StatCards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="총 참가자" value={participants.length} icon={Users} color="indigo" />
        <StatCard title="총 팀 수" value={teams.length} icon={Flag} color="blue" />
        <StatCard
          title="제출 완료"
          value={`${submittedCount}/${teams.length}`}
          icon={FileCheck}
          color="green"
        />
        <StatCard
          title="심사 완료"
          value={`${scoredCount}/${teams.length}`}
          icon={Trophy}
          color="purple"
        />
      </div>

      {/* ── 팀별 제출 현황 ── */}
      <Card title="팀별 제출 현황" className="mb-6">
        <div className="space-y-5">
          {teams.map((team) => {
            const submitted = team.submitStatus === 'submitted';
            return (
              <div key={team.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-800 truncate">{team.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">팀원 {team.members.length}명</span>
                  </div>
                  <Badge status={team.submitStatus} />
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      submitted ? 'w-full bg-indigo-500' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 최근 공지사항 ── */}
      <Card title="최근 공지사항">
        <ul className="divide-y divide-gray-100">
          {recentNotices.map((notice) => (
            <li key={notice.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 leading-snug">{notice.title}</p>
                <span className="text-xs text-gray-400 shrink-0">{notice.date}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{notice.author}</p>
              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{notice.content}</p>
            </li>
          ))}
        </ul>
      </Card>
    </AdminLayout>
  );
}
