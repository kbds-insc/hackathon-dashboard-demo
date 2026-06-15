import { useState } from 'react';
import { ExternalLink, X, Copy, Check } from 'lucide-react';
import { getMobileOS } from '../../utils/inAppBrowser';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InAppBrowserGuide({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const os = getMobileOS();

  const handleOpenExternal = () => {
    const url = window.location.href;
    // 기본 브라우저가 또 다른 인앱(네이버 앱 등)일 수 있으므로,
    // Android에서는 Chrome을 명시적으로 강제 실행해 루프를 방지한다.
    const cleaned = url.replace(/^https?:\/\//, '');
    window.location.href =
      `intent://${cleaned}#Intent;scheme=https;package=com.android.chrome;` +
      `S.browser_fallback_url=${encodeURIComponent(url)};end`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('링크 복사 실패');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
            <ExternalLink className="w-4 h-4 text-indigo-500" />
            브라우저에서 열기
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          현재 인앱 브라우저에서는 파일 다운로드가 제한됩니다.
          모바일은 Chrome·Safari에서, PC는 복사한 링크를 브라우저에 붙여넣어
          다시 시도해 주세요.
        </p>

        {os === 'android' ? (
          <button
            onClick={handleOpenExternal}
            className="w-full py-2.5 mb-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Chrome으로 열기
          </button>
        ) : (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 mb-3 text-xs text-gray-600 leading-relaxed">
            화면의 <strong>공유/더보기(···)</strong> 버튼을 누른 뒤{' '}
            <strong>'Safari로 열기'</strong>를 선택해 주세요.
          </div>
        )}

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-green-500" />링크 복사됨</>
          ) : (
            <><Copy className="w-3.5 h-3.5" />링크 복사</>
          )}
        </button>
      </div>
    </div>
  );
}
