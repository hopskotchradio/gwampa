import NBASchedule from './components/NBASchedule'
import NationalsSchedule from './components/NationalsSchedule'
import './App.css'

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* NBA Section */}
        <div className="col-md-6 p-4 border-end">
          <h2 className="mb-4">NBA Games</h2>
          <NBASchedule />
        </div>
        
        {/* Nationals Section */}
        <div className="col-md-6 p-4">
          <h2 className="mb-4">Nationals Games</h2>
          <NationalsSchedule />
        </div>
      </div>
    </div>
  )
}

export default App
