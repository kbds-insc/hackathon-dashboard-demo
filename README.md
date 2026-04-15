# 해커톤 운영 대시보드

React + TypeScript + Vite 기반의 해커톤 운영 웹앱입니다.  
관리자, 심사위원, 참가자 화면을 분리해 참가자 관리, 팀 편성, 공지, 제출, 점수 입력 기능을 제공합니다.

## 기술 스택

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- React Router DOM 7
- Supabase
- lucide-react

## 주요 기능

### 관리자

- 참가자 관리
  - 인라인 행 추가/수정
  - 다중 행 동시 편집 및 일괄 저장
  - 신규 행 최대 50개까지 추가
  - 모바일/PC 동일한 인라인 편집 흐름
  - 모바일에서는 가로 스크롤로 그리드 사용
- 팀 관리
  - 팀 추가/수정 팝업 UI 통일
  - 좌측에서 무소속 승인 참가자 검색 및 다중 선택
  - 우측에서 `n조` 자동 제안, 팀명/설명 입력, 팀원 구성
  - 모바일에서는 풀스크린에 가까운 1단 레이아웃으로 동작
  - 선택된 팀원 목록은 내부 스크롤 처리
  - 팀 추가/수정 직후 팀 개수와 팀 정보 즉시 반영
- 자동 매칭
  - `approved && team === ''` 대상만 배정
  - 잠금 팀에는 배정하지 않음
- 공지 관리
- 제출 현황 확인
- 점수 현황 조회
- 점수 입력
  - 팀별 저장 / 전체 저장
  - 저장 후 서버 재조회로 화면 동기화

### 참가자

- 내 팀 정보 확인
- 타임라인 확인
- 공지 확인
- 제출하기
- 알림 확인

## 최근 반영 사항

- 참가자 등록/수정을 모달이 아닌 인라인 그리드 편집으로 변경
- 참가자 등록 직후 그리드에 바로 보이도록 즉시 반영 처리
- 팀 추가/수정 팝업을 동일한 구조로 통일
- 팀 추가/수정 직후 팀 목록, 팀 개수, 팀 정보가 바로 반영되도록 수정
- 팀 추가/수정 팝업을 모바일에 맞게 재구성
- 관리자 점수 입력 화면을 저장 후 재조회 방식으로 변경

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 설정합니다.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

기본 주소: `http://localhost:5173`

### 4. 검증

```bash
npm run lint
npm run build
```

## 라우트

### 공통

- `/login`: 로그인

### 관리자 / 심사위원

- `/admin`: 관리자 대시보드
- `/admin/participants`: 참가자 및 팀 관리
- `/admin/notices`: 공지 관리
- `/admin/submissions`: 제출 현황
- `/admin/scores`: 점수 현황
- `/admin/score-input`: 점수 입력

`/admin/scores`, `/admin/score-input` 은 `admin`, `judge` 권한 모두 접근 가능합니다.

### 참가자

- `/participant`: 참가자 대시보드
- `/participant/schedule`: 일정
- `/participant/notices`: 공지
- `/participant/submit`: 제출하기
- `/participant/notifications`: 알림

## 프로젝트 구조

```text
src/
  api/
    milestones.ts
    notices.ts
    notifications.ts
    participants.ts
    scores.ts
    submissions.ts
    teams.ts
  components/
    layout/
    ui/
  contexts/
    AuthContext.tsx
    useAuth.ts
  data/
    hackathonStore.ts
    mockData.ts
    scoreStore.ts
  hooks/
    useAllJudgeScores.ts
    useCurrentParticipant.ts
    useJudgeScores.ts
    useMilestones.ts
    useNotices.ts
    useNotifications.ts
    useParticipants.ts
    useScores.ts
    useTeams.ts
  lib/
    supabase.ts
  pages/
    admin/
    participant/
  App.tsx
  main.tsx
```

## 상태 관리 규칙

- 참가자/팀 상태 변경은 `src/data/hackathonStore.ts`의 helper 함수를 통해 처리합니다.
- 점수 상태 변경은 `src/data/scoreStore.ts`를 사용합니다.
- 화면에서 store 데이터를 직접 변경하지 않습니다.

## 팀 운영 규칙

### 자동 매칭 규칙

- 대상은 `approved && team === ''` 참가자만 허용
- 잠금 팀에는 배정 불가

### 팀 잠금 규칙

- 잠금된 팀은 수정/삭제/자동매칭 배정 불가
- 잠금된 팀 소속 참가자는 팀 변경/삭제 불가

## 참고

- 현재 데이터는 Supabase를 기준으로 읽기/쓰기 합니다.
- 일부 화면은 실시간 구독을 사용하고, 일부 화면은 저장 후 재조회 또는 낙관적 반영으로 즉시 갱신합니다.
