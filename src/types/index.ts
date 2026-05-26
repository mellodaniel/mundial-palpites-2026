export type MatchStatus = 'scheduled' | 'locked' | 'finished';

export type Match = {
  id: string;
  externalId?: string;
  matchNumber: number;
  stage: string;
  groupName?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
  stadium: string;
  city: string;
  country: string;
  kickoffUtc: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
};

export type MatchImportItem = {
  externalId: string;
  matchNumber: number;
  stage: string;
  groupName?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
  homeTeamPlaceholder?: string;
  awayTeamPlaceholder?: string;
  stadium: string;
  city: string;
  country: string;
  kickoffUtc: string;
  status?: MatchStatus;
  source?: string;
};

export type Prediction = {
  id: string;
  userId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  points: number;
  exactScore: boolean;
  correctOutcome: boolean;
};

export type RankingRow = {
  userId: string;
  name: string;
  totalPoints: number;
  exactScores: number;
  correctOutcomes: number;
  totalPredictions: number;
};

export type Profile = {
  id: string;
  name: string;
  avatarUrl?: string;
  isAdmin: boolean;
  timezone: string;
};