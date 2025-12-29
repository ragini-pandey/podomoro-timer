import { useState, useEffect, useRef } from 'react'
import './App.css'
import BackgroundSlider from './BackgroundSlider'
import SpotifyWidget from './SpotifyWidget'
import SettingsWidget from './SettingsWidget'
import { BACKGROUNDS, TIMER_MODES } from './constants'

function App() {
  const [mode, setMode] = useState('POMODORO')
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.POMODORO.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedBackground, setSelectedBackground] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    let interval = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRunning(false)
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e))
      }
    }
  }, [timeLeft, isRunning])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setTimeLeft(TIMER_MODES[newMode].duration)
    setIsRunning(false)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(TIMER_MODES[mode].duration)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((TIMER_MODES[mode].duration - timeLeft) / TIMER_MODES[mode].duration) * 100

  return (
    <div className="app">
      <BackgroundSlider selectedBackground={selectedBackground} />
      <SpotifyWidget />
      <SettingsWidget 
        currentBackground={selectedBackground}
        onBackgroundChange={setSelectedBackground}
      />
      <div className="timer-container">
        <div className="mode-selector">
          {Object.entries(TIMER_MODES).map(([key, value]) => (
            <button
              key={key}
              className={`mode-button ${mode === key ? 'active' : ''}`}
              onClick={() => handleModeChange(key)}
            >
              {value.label}
            </button>
          ))}
        </div>

        <div className="timer-display">
          <svg className="progress-ring" width="300" height="300">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
            <circle
              className="progress-ring-circle-bg"
              cx="150"
              cy="150"
              r="130"
            />
            <circle
              className="progress-ring-circle"
              cx="150"
              cy="150"
              r="130"
              style={{
                strokeDasharray: `${2 * Math.PI * 130}`,
                strokeDashoffset: `${2 * Math.PI * 130 * (1 - progress / 100)}`
              }}
            />
          </svg>
          <div className="time-text">{formatTime(timeLeft)}</div>
        </div>

        <div className="controls">
          <button className="control-button primary" onClick={toggleTimer}>
            {isRunning ? 'pause' : 'start'}
          </button>
          <button className="control-button secondary" onClick={resetTimer}>
            reset
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3EdBDCC0fPTgjMGHm7A7+OZUQ0PVKvo7K5aGQlCmuDyu3Ed"
      />
    </div>
  )
}

export default App
