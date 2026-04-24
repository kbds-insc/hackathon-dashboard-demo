interface Props {
  content: string;
  className?: string;
}

const URL_PATTERN = /(https?:\/\/[^\s]+)/;

export default function NoticeContent({ content, className }: Props) {
  const handleUrlClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`다음 URL로 이동하시겠습니까?\n\n${url}`)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const parts = content.split(URL_PATTERN);

  return (
    <p className={className}>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <button
            key={i}
            type="button"
            onClick={(e) => handleUrlClick(part, e)}
            className="break-all text-indigo-500 underline underline-offset-2 hover:text-indigo-700 transition-colors"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
