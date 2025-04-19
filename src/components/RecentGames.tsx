import { useEffect, useState } from 'react'
import { API_ENDPOINTS, API_KEYS } from '../config/api'
import axios from 'axios'

interface RecentGame {
  id: number
  homeTeam: string
  awayTeam: string
  homeTeamLogo: string
  awayTeamLogo: string
  homeScore: number
  awayScore: number
  date: string
}

const RecentGames = () => {
  const [games, setGames] = useState<RecentGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        const today = new Date()
        const lastWeek = new Date(today)
        lastWeek.setDate(today.getDate() - 7)
        
        console.log('Fetching games from:', lastWeek.toISOString().split('T')[0], 'to', today.toISOString().split('T')[0])
        
        const response = await axios.get(API_ENDPOINTS.NBA_GAMES, {
          params: { 
            date: lastWeek.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
          },
          headers: {
            'X-RapidAPI-Key': API_KEYS.RAPID_API_KEY,
            'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
          }
        })

        console.log('API Response:', response.data)

        const formattedGames = response.data.response
          .filter((game: any) => game.status.short === 'FT') // Only finished games
          .map((game: any) => ({
            id: game.id,
            homeTeam: game.teams.home.name,
            awayTeam: game.teams.visitors.name,
            homeTeamLogo: game.teams.home.logo,
            awayTeamLogo: game.teams.visitors.logo,
            homeScore: game.scores.home.points,
            awayScore: game.scores.visitors.points,
            date: new Date(game.date.start).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })
          }))
          .sort((a: RecentGame, b: RecentGame) => b.id - a.id) // Sort by most recent first

        console.log('Formatted Games:', formattedGames)
        setGames(formattedGames)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching games:', err)
        setError('Failed to fetch recent games')
        setLoading(false)
      }
    }

    fetchRecentGames()
  }, [])

  if (loading) return <div className="spinner-border" role="status" />
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div className="list-group">
      {games.map(game => (
        <div key={game.id} className="list-group-item">
          <div className="d-flex flex-column">
            <small className="text-muted mb-2">{game.date}</small>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img 
                  src={game.awayTeamLogo} 
                  alt={game.awayTeam} 
                  className="team-logo me-2"
                  style={{ width: '30px', height: '30px' }}
                />
                <span className="me-2">{game.awayTeam}</span>
                <span className="fw-bold">{game.awayScore}</span>
              </div>
              <div className="d-flex align-items-center">
                <img 
                  src={game.homeTeamLogo} 
                  alt={game.homeTeam} 
                  className="team-logo me-2"
                  style={{ width: '30px', height: '30px' }}
                />
                <span className="me-2">{game.homeTeam}</span>
                <span className="fw-bold">{game.homeScore}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentGames 