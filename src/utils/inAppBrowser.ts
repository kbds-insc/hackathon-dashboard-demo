/**
 * 인앱 브라우저(카카오톡·네이버 등 WebView) 감지 유틸.
 * WebView에서는 blob 다운로드가 차단되므로, 다운로드 전에 감지해 안내한다.
 * 정식 브라우저(PC/모바일 Chrome·Safari)는 null을 반환한다.
 */
export type InAppBrowser =
  | 'kakaotalk'
  | 'naver'
  | 'line'
  | 'instagram'
  | 'facebook'
  | 'other'
  | null;

export type MobileOS = 'ios' | 'android' | 'other';

export function detectInAppBrowser(): InAppBrowser {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;

  if (/KAKAOTALK/i.test(ua)) return 'kakaotalk';
  if (/NAVER\(inapp/i.test(ua)) return 'naver';
  if (/Line\//i.test(ua)) return 'line';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV/i.test(ua)) return 'facebook';
  // Android WebView 일반 감지 (인앱 브라우저 공통 표식)
  if (/; wv\)/i.test(ua)) return 'other';

  return null;
}

export function getMobileOS(): MobileOS {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}
