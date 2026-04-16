 RLS 체크리스트                                                                                       
                                                                                                       
  1. participants                                                                                      
                                                                                                       
  - anon은 전부 거부되어야 합니다.
  - participant는 자기 행만 select 가능해야 합니다. 조건 예: user_id = auth.uid()                      
  - participant는 자기 행이라도 user_id, status, team_id, email 같은 민감 필드는 직접 update 못 하게 막    아야 합니다.                                                                                       
  - admin만 전체 조회/수정/삭제 가능해야 합니다.                                                       
  - 이메일 기준 조회를 허용할지 명확히 정해야 합니다. 허용하면 계정 점유 리스크가 생깁니다.            
  - user_id 연결은 클라이언트 직접 update가 아니라 RPC/Edge Function으로만 처리하는 게 안전합니다.     
                                                                                                       
  2. teams
                                                                                                       
  - participant는 읽기만 가능하게 둘지, 자기 팀만 읽게 할지 결정해야 합니다.                           
  - participant는 insert/update/delete 전부 거부하는 것이 기본값이어야 합니다.                         
  - judge가 팀 목록을 봐야 하면 select만 허용합니다.                                                   
  - admin만 생성/수정/삭제 가능해야 합니다.                                                            
  - locked = true인 팀에 대해 수정/삭제 금지 규칙은 RLS 또는 DB 트리거로 강제해야 합니다. UI만으로 막으
    면 부족합니다.                                                                                     
                                                                                                       
  3. submissions                                                                                       
                                                                                                       
  - participant는 자기 팀 제출만 select/insert/update 가능해야 합니다.                                 
  - “자기 팀” 판정은 세션 유저의 auth.uid()가 연결된 participants.user_id를 통해 해야 합니다.          
  - participant는 다른 팀 team_id로 upsert 못 해야 합니다.                                             
  - admin은 전체 조회 가능해야 합니다.                                                                 
  - judge가 제출물을 봐야 하면 전체 select 허용 여부를 명확히 정해야 합니다.                           
  - URL 필드는 RLS가 아니라 입력 검증으로 https만 허용하는 정책을 추가해야 합니다.

  4. scores                                                                                            

  - judge는 자기 점수만 select/update/insert 가능해야 합니다. 조건 예: judge_id = auth.uid()           
  - judge는 자기 judge_id를 다른 사람 ID로 넣지 못 해야 합니다.                                        
  - judge_name은 클라이언트 신뢰값으로 두지 말고 서버에서 세션 기반으로 채우는 쪽이 낫습니다.          
  - admin은 전체 조회 가능해야 합니다.                                                                 
  - admin이 점수 수정까지 가능한지 정책으로 명확히 정해야 합니다.                                      
  - participant는 점수 테이블 직접 접근을 기본 거부하는 편이 안전합니다. 공개가 필요하면 집계 결과만 별    도 뷰/RPC로 노출합니다.                                                                            
                                                                                                       
  5. notices                                                                                           
                                                                                                       
  - 모든 로그인 사용자가 읽을 수 있는지, 참가자만 읽을 수 있는지 먼저 결정합니다.                      
  - admin만 insert/update/delete 가능해야 합니다.                                                      
  - judge와 participant는 쓰기 금지여야 합니다.                                                        

  6. notifications                                                                                     
                                                                                                       
  - participant는 user_id = auth.uid()인 행과 공용 알림(user_id is null)만 조회 가능해야 합니다.       
  - 읽음 처리 update도 자기 알림만 가능해야 합니다.                                                    
  - 공용 알림(user_id is null)의 읽음 상태를 모든 사용자가 공용으로 바꾸는 구조면 안 됩니다.           
  - 공용 알림 읽음 여부가 사용자별이어야 하면 별도 notification_reads 테이블이 더 안전합니다.          
  - admin만 알림 생성 가능하도록 정해야 합니다.                                                        
                                                                                                       
  7. 인증 메타데이터                                                                                   
                                                                                                       
  - RLS에서 user_metadata.role를 신뢰하지 마세요.                                                      
  - 역할 판정은 auth.jwt() -> app_metadata.role 또는 별도 서버 관리 테이블만 사용해야 합니다.          
  - app_metadata.role이 비어 있는 계정 처리 방식도 정해야 합니다. 기본은 최소권한이어야 합니다.        
                                                                                                       
  8. Edge Function / RPC                                                                               
                                                                                                       
  - participant-admin 같은 함수는 내부에서 app_metadata.role = admin만 신뢰해야 합니다.                
  - 함수에서 받은 participant_id, user_id, team_id를 그대로 쓰지 말고 세션 기준 재검증해야 합니다.     
  - 서비스 롤 함수는 “누가 어떤 액션을 왜 할 수 있는지”를 함수 내부에서 다시 검사해야 합니다.          
                                                                                                       
  9. 기본 정책 점검                                                                                    
                                                                                                       
  - 모든 테이블에 대해 ALTER TABLE ... ENABLE ROW LEVEL SECURITY가 켜져 있는지 확인합니다.             
  - 필요한 테이블은 FORCE ROW LEVEL SECURITY도 검토합니다.                                             
  - “테스트용 전체 허용 정책”이 남아 있지 않은지 확인합니다.                                           
  - authenticated 전체 허용 select 정책이 있는지 특히 점검합니다.                                      
                                                                                                       
  10. 검증 방법                                                                                        
  - 심사위원 계정으로 다른 심사위원 judge_id를 넣은 점수 upsert가 막히는지 확인합니다.
  - 참가자 계정으로 다른 팀 team_id 제출 upsert가 막히는지 확인합니다.
  - 참가자 계정으로 participants.user_id 직접 변경이 막히는지 확인합니다.
  - 참가자 계정으로 공지/팀/참가자 삭제가 전부 막히는지 확인합니다.

  우선순위

  - 1순위: participants, scores, submissions
  - 2순위: teams, notifications
  - 3순위: notices
