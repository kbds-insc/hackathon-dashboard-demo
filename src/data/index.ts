// 공유 데이터 및 타입 정의
export interface Team {
  id: string;
  name: string;
  members: string[];
  score: number;
}

export const sampleTeams: Team[] = [
  { id: '1', name: 'Team Alpha', members: ['Alice', 'Bob'], score: 85 },
  { id: '2', name: 'Team Beta', members: ['Charlie', 'David'], score: 92 },
  { id: '3', name: 'Team Gamma', members: ['Eve', 'Frank'], score: 78 },
];
