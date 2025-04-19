import { useEffect, useState } from 'react'
import { API_ENDPOINTS, API_KEYS } from '../config/api'
import axios from 'axios'

interface Game {
  id: number
  opponent: string
  isHome: boolean
  startTime: string
  channel: string
}

const NationalsSchedule = () => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNationalsGames = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        // Nationals team ID is 120
        const response = await axios.get(API_ENDPOINTS.MLB_GAMES, {
          params: {
            gameDate: today
          },
          headers: {
            'X-RapidAPI-Key': API_KEYS.RAPID_API_KEY,
            'X-RapidAPI-Host': 'tank01-mlb-live-in-game-real-time-statistics.p.rapidapi.com'
          }
        })

        const formattedGames = response.data.dates[0]?.games.map((game: any) => {
          const nationals = game.teams.away.team.id === 120 ? game.teams.away : game.teams.home
          const opponent = game.teams.away.team.id === 120 ? game.teams.home : game.teams.away
          const broadcast = game.broadcasts?.find((b: any) => b.type === 'TV')

          return {
            id: game.gamePk,
            opponent: opponent.team.name,
            isHome: nationals.team.id === game.teams.home.team.id,
            startTime: new Date(game.gameDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/New_York',
              timeZoneName: 'short'
            }),
            channel: broadcast?.name || 'MASN'
          }
        }) || []

        setGames(formattedGames)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch Nationals games')
        setLoading(false)
      }
    }

    fetchNationalsGames()
  }, [])

  if (loading) return <div className="spinner-border" role="status" />
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div className="list-group">
      {games.map(game => (
        <div key={game.id} className="list-group-item">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">
                {game.isHome ? 
                  `${game.opponent} @ Nationals` : 
                  `Nationals @ ${game.opponent}`}
              </h5>
              <small className="text-muted">{game.startTime}</small>
            </div>
            <span className="badge bg-primary rounded-pill">{game.channel}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NationalsSchedule 