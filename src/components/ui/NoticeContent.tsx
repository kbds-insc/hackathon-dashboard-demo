import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { ExternalLink, X } from 'lucide-react';

interface Props {
  content: string;
  className?: string;
}

export default function NoticeContent({ content, className }: Props) {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const handleUrlClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingUrl(url);
  };

  const handleConfirm = () => {
    if (pendingUrl) window.open(pendingUrl, '_blank', 'noopener,noreferrer');
    setPendingUrl(null);
  };

  return (
    <>
      <div className={className}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            a: ({ href, children }) => (
              <button
                type="button"
                onClick={(e) => handleUrlClick(href ?? '', e)}
                className="break-all text-left text-indigo-500 underline underline-offset-2 hover:text-indigo-700 transition-colors"
              >
                {children}
              </button>
            ),
            h1: ({ children }) => <h1 className="text-lg font-bold text-gray-800 mt-2 mb-1">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold text-gray-700 mt-2 mb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-700 mt-1.5 mb-0.5">{children}</h3>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            ul: ({ children }) => <ul className="list-disc list-outside pl-4 space-y-0.5 my-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-outside pl-4 space-y-0.5 my-1">{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
            code: ({ children }) => (
              <code className="bg-gray-100 rounded px-1 py-0.5 text-[11px] font-mono text-gray-700">{children}</code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-gray-300 pl-3 text-gray-500 italic my-1">{children}</blockquote>
            ),
            hr: () => <hr className="border-gray-200 my-2" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* ── URL 이동 확인 모달 ── */}
      {pendingUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setPendingUrl(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                <ExternalLink className="w-4 h-4 text-indigo-500" />
                외부 링크로 이동
              </div>
              <button
                onClick={() => setPendingUrl(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">다음 URL로 이동하시겠습니까?</p>
            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 break-all text-xs text-gray-600 max-h-24 overflow-y-auto">
              {pendingUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPendingUrl(null)}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                이동
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
