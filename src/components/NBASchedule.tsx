import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { API_KEYS } from '../config/api'
import axios from 'axios'
import React from 'react'

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
}

const GameItem = React.memo(({ game, showScores = false }: { game: Game, showScores?: boolean }) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSIyMCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjUiPk5CQTwvdGV4dD48L3N2Zz4='
  }, [])

  return (
    <div className="list-group-item d-flex flex-row justify-content-between align-items-center">
      {/* Away Team */}
      <div className="d-flex flex-column align-items-center" style={{ width: '120px' }}>
        <img 
          src={game.awayTeamLogo} 
          alt={game.awayTeam} 
          className="team-logo mb-2"
          style={{ 
            width: '50px', 
            height: '50px',
            objectFit: 'contain',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}
          onError={handleImageError}
        />
        <span className="fw-bold text-truncate" style={{ width: '100%', textAlign: 'center' }}>
          {game.awayTeam}
        </span>
      </div>

      {/* Center Content */}
      <div className="d-flex flex-column align-items-center" style={{ minWidth: '80px' }}>
        <span className="fs-4 mb-2">@</span>
        {showScores && (
          <span className="fw-bold fs-5">
            {game.awayScore} - {game.homeScore}
          </span>
        )}
        {!showScores && (
          <>
            <span className="badge bg-primary rounded-pill mb-1">{game.channel}</span>
            <small className="text-muted">{game.date}</small>
            <small className="text-muted">{game.startTime}</small>
          </>
        )}
      </div>

      {/* Home Team */}
      <div className="d-flex flex-column align-items-center" style={{ width: '120px' }}>
        <img 
          src={game.homeTeamLogo} 
          alt={game.homeTeam} 
          className="team-logo mb-2"
          style={{ 
            width: '50px', 
            height: '50px',
            objectFit: 'contain',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}
          onError={handleImageError}
        />
        <span className="fw-bold text-truncate" style={{ width: '100%', textAlign: 'center' }}>
          {game.homeTeam}
        </span>
      </div>
    </div>
  )
})

const NBASchedule = () => {
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
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

      const processGames = (response: any) => {
        if (!response.data || !response.data.response) {
          return []
        }

        return response.data.response.map((game: any) => ({
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
          startDateTime: new Date(game.date.start)
        }))
      }

      const todayGames = processGames(todayResponse)
      const nextWeekGames = processGames(nextWeekResponse)

      const recent = todayGames
        .filter((game: Game) => game.status === 3)
        .sort((a: Game, b: Game) => b.id - a.id)
        .slice(0, 5)

      const upcoming = [
        ...todayGames.filter((game: Game) => game.status === 1),
        ...nextWeekGames.filter((game: Game) => game.status === 1)
      ]
        .sort((a: Game, b: Game) => a.startDateTime.getTime() - b.startDateTime.getTime())
        .slice(0, 5)

      setRecentGames(recent)
      setUpcomingGames(upcoming)
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
    <div>
      <div className="mb-4">
        <h3 className="mb-3">Recent Games</h3>
        <div className="list-group">
          {recentGames.map(game => (
            <GameItem key={game.id} game={game} showScores={true} />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="mb-3">Upcoming Games</h3>
        <div className="list-group">
          {upcomingGames.map(game => (
            <GameItem key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default NBASchedule 