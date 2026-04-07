import { useState } from 'react';
import ParticipantLayout from '../../components/layout/ParticipantLayout';
import Card from '../../components/ui/Card';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface SubmissionData {
  github: string;
  slides: string;
  description: string;
  submittedAt: string;
}

// Team Alpha(t1)는 mockData상 이미 제출 완료
const INITIAL_SUBMISSION: SubmissionData = {
  github: 'https://github.com/team-alpha/disaster-response',
  slides: 'https://docs.example.com/alpha-slides',
  description:
    'AI 기반 실시간 재난 대응 플랫폼입니다. 시민 제보와 공공 API 데이터를 결합하여 재난 상황을 실시간으로 시각화하고, 머신러닝 모델로 대응 자원을 자동 배치합니다.',
  submittedAt: '2025-04-20 14:23',
};

export default function Submit() {
  const [submitted, setSubmitted] = useState(true);
  const [submission, setSubmission] = useState<SubmissionData>(INITIAL_SUBMISSION);

  // 폼 상태 (수정 전 초기값 = 현재 제출 데이터)
  const [github, setGithub] = useState(INITIAL_SUBMISSION.github);
  const [slides, setSlides] = useState(INITIAL_SUBMISSION.slides);
  const [description, setDescription] = useState(INITIAL_SUBMISSION.description);

  const isFormValid = github.trim() && slides.trim() && description.trim();

  const handleSubmit = () => {
    if (!isFormValid) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const submittedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setSubmission({ github: github.trim(), slides: slides.trim(), description: description.trim(), submittedAt });
    setSubmitted(true);
  };

  return (
    <ParticipantLayout>
      {/* ── 현재 제출 상태 ── */}
      <div
        className={`flex items-center gap-4 rounded-xl border px-5 py-4 mb-6 ${
          submitted ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'
        }`}
      >
        {submitted ? (
          <CheckCircle2 className="w-9 h-9 text-green-500 shrink-0" />
        ) : (
          <AlertCircle className="w-9 h-9 text-gray-400 shrink-0" />
        )}
        <div>
          <p className={`font-semibold ${submitted ? 'text-green-800' : 'text-gray-700'}`}>
            {submitted ? '제출 완료' : '미제출'}
          </p>
          <p className={`text-xs mt-0.5 ${submitted ? 'text-green-600' : 'text-gray-400'}`}>
            {submitted ? `${submission.submittedAt} 제출됨` : '아직 제출하지 않았습니다.'}
          </p>
        </div>
      </div>

      {/* ── 제출 완료 상태 ── */}
      {submitted ? (
        <>
          <Card title="제출 내역" className="mb-5">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">GitHub 저장소</p>
                <a
                  href={submission.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline break-all"
                >
                  {submission.github}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">발표 자료</p>
                <a
                  href={submission.slides}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline break-all"
                >
                  {submission.slides}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">프로젝트 설명</p>
                <p className="text-sm text-gray-700 leading-relaxed">{submission.description}</p>
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <p>
              제출 내용 수정이 필요한 경우 운영진에게 문의해주세요.
              <br />
              <span className="text-amber-600 text-xs">contact@hackathon2025.com</span>
            </p>
          </div>
        </>
      ) : (
        <>
          {/* ── 주의사항 ── */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-sm text-blue-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <ul className="space-y-1 text-xs leading-relaxed">
              <li>• GitHub 저장소는 <strong>public</strong>으로 설정해주세요.</li>
              <li>• 발표 자료는 심사위원이 접근 가능한 링크여야 합니다.</li>
              <li>• 제출 후 수정은 운영진에게 별도 문의가 필요합니다.</li>
              <li>• 제출 마감 이후 접수된 결과물은 심사에서 제외될 수 있습니다.</li>
            </ul>
          </div>

          {/* ── 제출 폼 ── */}
          <Card title="결과물 제출">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  GitHub URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-team/project"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  발표 자료 URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://slides.example.com/your-presentation"
                  value={slides}
                  onChange={(e) => setSlides(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  프로젝트 설명 <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="프로젝트 소개, 주요 기능, 기술 스택 등을 간략히 설명해주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300 resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                제출하기
              </button>
            </div>
          </Card>
        </>
      )}
    </ParticipantLayout>
  );
}
