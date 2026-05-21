import ParticipantLayout from '../../components/layout/ParticipantLayout';
import Card from '../../components/ui/Card';
import { useCurrentParticipant } from '../../hooks/useCurrentParticipant';
import { useScores } from '../../hooks/useScores';
import { useSettings } from '../../hooks/useSettings';
import { SCORE_CRITERIA } from '../../data/scoreStore';
import { Clock, Star, Trophy } from 'lucide-react';

const CRITERIA_DESCRIPTIONS: Record<string, string[]> = {
  creativity: [
    '기존과 차별화된 혁신적인 아이디어인가?',
    '내부 Pain Point를 차별화된 아이디어를 통해 해결할 수 있는가?',
  ],
  practicality: [
    '기존 업무 프로세스 대비 Agent 도입 후 소요 시간이나 운영 비용이 획기적으로 줄어드는가?',
    '실제 현업이나 비즈니스에 적용 가능한 현실적인 방안인가?',
  ],
  completion: [
    '기술적으로 프로토타입이 안정적으로 작동하는가?',
    '데이터를 처리하고 Agent의 작동 파이프라인이 효율적이고 안정적으로 작동하는가?',
  ],
  presentation: [
    '서사 구조가 명확하며, 팀의 아이디어를 논리적으로 전달하고, 질의응답에 전문적으로 답하는가?',
  ],
};

export default function ParticipantScores() {
  const { team, loading } = useCurrentParticipant();
  const allScores = useScores();
  const { settings, loaded: settingsLoaded } = useSettings();

  const criteriaMax: Record<string, number> = {
    creativity: settings.creativityMax,
    practicality: settings.practicalityMax,
    completion: settings.completionMax,
    presentation: settings.presentationMax,
  };

  const myScore = team ? allScores.find((s) => s.teamId === team.id) : undefined;
  const scoredTeams = allScores
    .filter((s) => s.judgeCount > 0)
    .sort((a, b) => b.total - a.total);
  const totalScoredTeams = scoredTeams.length;
  const myRank =
    myScore && myScore.judgeCount > 0
      ? scoredTeams.filter((s) => s.total > myScore.total).length + 1
      : null;

  return (
    <ParticipantLayout>
      {/* 평가 기준 — 모든 참가자에게 항상 표시 */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">평가 기준</h2>
        <div className="grid grid-cols-1 gap-3">
          {SCORE_CRITERIA.map(({ key, label }) => (
            <div key={key} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 shrink-0">
                  {settingsLoaded ? (
                    <>
                      <span className="text-xl font-black text-white leading-none">{criteriaMax[key]}</span>
                      <span className="text-[10px] font-medium text-indigo-200 leading-none mt-0.5">점</span>
                    </>
                  ) : (
                    <span className="w-8 h-3 bg-indigo-400 rounded animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-bold text-indigo-900">{label}</span>
              </div>
              <ul className="px-4 py-3 space-y-2">
                {(CRITERIA_DESCRIPTIONS[key] ?? []).map((desc, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-gray-500 leading-relaxed">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-100 text-indigo-500 font-bold flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 평가 결과 */}
      <Card title="평가 결과">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-10">불러오는 중...</p>
        ) : !team ? (
          <p className="text-sm text-gray-400 text-center py-10">아직 지정된 팀이 없습니다.</p>
        ) : !settings.scoresPublished ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <Clock className="w-6 h-6 text-gray-300 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">결과 미공개</p>
              <p className="text-xs text-gray-400 mt-0.5">심사가 완료되면 관리자가 결과를 공개합니다.</p>
            </div>
          </div>
        ) : !myScore || myScore.judgeCount === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <Star className="w-6 h-6 text-blue-300 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-600">심사 진행 중</p>
              <p className="text-xs text-blue-400 mt-0.5">아직 평가가 완료되지 않았습니다.</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-4">
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-200 shrink-0">
                <Trophy className="w-4 h-4 text-amber-500 mb-0.5" />
                <span className="text-lg font-bold text-amber-700 leading-none">{myRank}</span>
                <span className="text-xs text-amber-600 leading-none">등</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {myScore.total}
                  <span className="text-sm font-normal text-gray-400 ml-1">/ 100점</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{totalScoredTeams}개 팀 중 {myRank}위</p>
              </div>
            </div>
            <div className="space-y-3">
              {SCORE_CRITERIA.map(({ key, label }) => {
                const max = criteriaMax[key];
                const score = myScore[key];
                const pct = max > 0 ? Math.round((score / max) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{label}</span>
                      <span className="text-xs font-medium text-gray-700">{score} / {max}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-right">
              심사위원 {myScore.judgeCount}명 평가 기준
            </p>
          </div>
        )}
      </Card>
    </ParticipantLayout>
  );
}
