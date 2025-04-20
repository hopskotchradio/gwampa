import { useEffect, useState, useCallback, useRef } from 'react'
import { API_KEYS } from '../config/api'
import axios from 'axios'
import NBACard from './NBACard'

interface Game {
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
  clock?: string | null
  currentPeriod?: number
}

interface APIGameResponse {
  id: number
  date: {
    start: string
  }
  status: {
    short: number
    clock?: string | null
  }
  teams: {
    home: {
      name: string
      logo: string
    }
    visitors: {
      name: string
      logo: string
    }
  }
  scores: {
    home: {
      points: number
    }
    visitors: {
      points: number
    }
  }
  arena: {
    broadcast?: {
      national?: string
    }
  }
  periods: {
    current: number
  }
}

interface APIResponse {
  data: {
    response: APIGameResponse[]
  }
}

const NBASchedule = () => {
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
  const [inProgressGames, setInProgressGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetching = useRef<boolean>(false)

  const fetchGames = useCallback(async () => {
    if (isFetching.current) return

    try {
      isFetching.current = true
      setLoading(true)
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1
      const season = currentMonth >= 10 ? currentYear : currentYear - 1
      
      const [todayResponse, nextWeekResponse] = await Promise.all([
        axios.get('https://api-nba-v1.p.rapidapi.com/games', {
          params: { 
            season: season,
            date: today.toISOString().split('T')[0]
          },
          headers: {
            'X-RapidAPI-Key': API_KEYS.RAPID_API_KEY,
            'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
          }
        }),
        axios.get('https://api-nba-v1.p.rapidapi.com/games', {
          params: { 
            season: season,
            date: nextWeek.toISOString().split('T')[0]
          },
          headers: {
            'X-RapidAPI-Key': API_KEYS.RAPID_API_KEY,
            'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
          }
        })
      ])

      const processGames = (response: APIResponse) => {
        if (!response.data || !response.data.response) {
          return []
        }

        return response.data.response.map((game: APIGameResponse) => ({
          id: game.id,
          homeTeam: game.teams.home.name,
          awayTeam: game.teams.visitors.name,
          homeTeamLogo: game.teams.home.logo,
          awayTeamLogo: game.teams.visitors.logo,
          startTime: new Date(game.date.start).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York',
            timeZoneName: 'short'
          }),
          date: new Date(game.date.start).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          channel: game.arena.broadcast?.national || 'Local broadcast',
          homeScore: game.scores?.home?.points,
          awayScore: game.scores?.visitors?.points,
          status: game.status.short,
          startDateTime: new Date(game.date.start),
          clock: game.status.clock || null,
          currentPeriod: game.periods.current || 0,
        }))
      }

      const todayGames = processGames(todayResponse)
      const nextWeekGames = processGames(nextWeekResponse)

      const recent = todayGames
        .filter((game: Game) => game.status === 3)
        .sort((a: Game, b: Game) => b.id - a.id)
        .slice(0, 5)

      const upcoming = [
        ...todayGames.filter((game: Game) => game.startDateTime > new Date()),
        ...nextWeekGames.filter((game: Game) => game.startDateTime > new Date())
      ]
        .sort((a: Game, b: Game) => a.startDateTime.getTime() - b.startDateTime.getTime())
        .slice(0, 5)

      const inProgress = todayGames.filter((game: Game) => game.status === 2)

      setRecentGames(recent)
      setUpcomingGames(upcoming)
      setInProgressGames(inProgress)
      setLoading(false)
    } catch (err) {
      console.error('Detailed error:', err)
      setError('Failed to fetch NBA games: ' + (err as Error).message)
      setLoading(false)
    } finally {
      isFetching.current = false
    }
  }, [])

  useEffect(() => {
    fetchGames()
  }, [])

  if (loading) return <div className="spinner-border" role="status" />
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div className="container d-flex flex-column">
      <div className="mb-4" style={{ flex: 1 }}>
        <h1 className="mb-3">Live</h1>
        <div className="d-flex flex-wrap justify-content-center">
          {inProgressGames.length === 0 ? (
            <div className="text-center text-muted" style={{ fontSize: '1.5rem' }}>There are currently no Live games being played, check back later</div>
          ) : (
            inProgressGames.map(game => (
              <NBACard key={game.id} game={game as Game} showScores={true} />
            ))
          )}
        </div>
      </div>

      <div className="mb-4" style={{ flex: 1 }}>
        <h1 className="mb-3">Recently Played</h1>
        <div className="d-flex flex-wrap justify-content-center">
          {recentGames.map(game => (
            <NBACard key={game.id} game={game} showScores={true} />
          ))}
        </div>
      </div>
      
      <div className="mb-4" style={{ flex: 1 }}>
        <h1 className="mb-3">Upcoming Games</h1>
        <div className="d-flex flex-wrap justify-content-center">
          {upcomingGames.map(game => (
            <NBACard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default NBASchedule 