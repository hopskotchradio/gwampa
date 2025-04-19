import React, { useCallback } from 'react'
import { Game } from './types'


interface NBACardProps {
  game: Game
  showScores?: boolean
}

const NBACard: React.FC<NBACardProps> = ({ game, showScores = false }) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSIyMCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjUiPk5CQTwvdGV4dD48L3N2Zz4='
  }, [])

  return (
    <div className="card mb-3" style={{ width: '600px', backgroundColor: '#333', color: 'white' }}>
      <div className="card-body d-flex justify-content-between align-items-center" style={{ display: 'flex' }}>
        {/* Away Team */}
        <div className="text-center" style={{ flex: 1 }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            backgroundColor: '#444',
            borderRadius: '10px',
            padding: '20px',
            margin: '0 auto 10px'
          }}>
            <img 
              src={game.awayTeamLogo} 
              alt={game.awayTeam} 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={handleImageError}
            />
          </div>
          <div className="text-white">{game.awayTeam}</div>
          {showScores && <div className="text-info fs-4">{game.awayScore}</div>}
        </div>

        {/* VS */}
        <div className="text-center mx-4">
          <div className="fs-6">vs</div>
          {!showScores && (
            <>
              <div className="text-muted small mt-2">{game.date}</div>
              <div className="text-muted small">{game.startTime}</div>
            </>
          )}
        </div>

        {/* Home Team */}
        <div className="text-center" style={{ flex: 1 }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            backgroundColor: '#444',
            borderRadius: '10px',
            padding: '20px',
            margin: '0 auto 10px'
          }}>
            <img 
              src={game.homeTeamLogo} 
              alt={game.homeTeam} 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={handleImageError}
            />
          </div>
          <div className="text-white">{game.homeTeam}</div>
          {showScores && <div className="text-info fs-4">{game.homeScore}</div>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(NBACard)
