import React from 'react'
import { Game } from './types'


interface NBACardProps {
  game: Game
  showScores?: boolean
}

const NBACard: React.FC<NBACardProps> = ({ game, showScores = false }) => {
  const getLogoPath = (teamName: string) => {
    return `/logos/${teamName.toLowerCase().replace(/\s/g, '-')}.png`
  }

  const formatQuarter = (quarter: number) => {
    switch (quarter) {
      case 1:
        return '1st Quarter'
      case 2:
        return '2nd Quarter'
      case 3:
        return '3rd Quarter'
      case 4:
        return '4th Quarter'
      default:
        return `${quarter}th Quarter`
    }
  }

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
              src={getLogoPath(game.awayTeam)} 
              alt={game.awayTeam} 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          <div className="text-white" style={{ fontSize: '1.5rem' }}>{game.awayTeam}</div>
          {showScores && game.status !== 1 && <div className="text-info" style={{ fontSize: '2rem' }}>{game.awayScore}</div>}
        </div>

        {/* Game Info */}
        <div className="text-center mx-4">
          <div style={{ fontSize: '2rem' }}>vs</div>
          {game.status === 3 ? (
            <div className="text-muted" style={{ fontSize: '1.5rem' }}>Final</div>
          ) : (
            <>
              {game.status === 2 && game.currentPeriod && <div className="text-muted" style={{ fontSize: '1.5rem' }}>{formatQuarter(game.currentPeriod)}</div>}
              {game.status === 2 && game.clock && <div className="text-muted" style={{ fontSize: '1.5rem' }}>Time Left: {game.clock}</div>}
            </>
          )}
          {!showScores && (
            <>
              <div className="text-muted mt-2" style={{ fontSize: '1.5rem' }}>{game.date}</div>
              <div className="text-muted" style={{ fontSize: '1.5rem' }}>{game.startTime}</div>
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
              src={getLogoPath(game.homeTeam)} 
              alt={game.homeTeam} 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          <div className="text-white" style={{ fontSize: '1.5rem' }}>{game.homeTeam}</div>
          {showScores && game.status !== 1 && <div className="text-info" style={{ fontSize: '2rem' }}>{game.homeScore}</div>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(NBACard)
