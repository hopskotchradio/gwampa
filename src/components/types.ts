export interface Game {
  id: number
  homeTeam: string
  awayTeam: string
  homeTeamLogo: string
  awayTeamLogo: string
  startTime: string
  channel: string
  homeScore?: number
  awayScore?: number
  date: string
  status: number
  startDateTime: Date
  currentPeriod?: number
  clock?: string | null
} 