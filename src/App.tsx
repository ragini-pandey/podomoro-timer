import { useState, useEffect, useRef } from 'react'
import './App.css'
import BackgroundSlider from './BackgroundSlider'
import SpotifyWidget from './SpotifyWidget'
import SettingsWidget from './SettingsWidget'
import { TIMER_MODES, TimerModeKey, BackgroundSelection } from './constants'
import { imageCache } from './utils/imageCache'
import { registerServiceWorker } from './utils/serviceWorker'

function App() {
  const [mode, setMode] = useState<TimerModeKey>('POMODORO')
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.POMODORO.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedBackground, setSelectedBackground] = useState<BackgroundSelection | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Cache all background images on mount and request notification permission
  useEffect(() => {
    // Register service worker for offline caching
    registerServiceWorker()

    const cacheImages = async () => {
      console.log('Starting to cache background images...')
      const status = await imageCache.preloadAllBackgrounds()
      console.log(`Image caching complete: ${status.loaded}/${status.total} loaded`, 
        status.failed.length > 0 ? `${status.failed.length} failed` : '')
    }

    cacheImages()

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission)
      })
    }
  }, [])

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
      
      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e))
      }

      // Show notification
      if (notificationPermission === 'granted') {
        const modeLabel = TIMER_MODES[mode].label
        new Notification('Timer Complete! 🎉', {
          body: `Your ${modeLabel} session has finished. Time for a break!`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'pomodoro-timer',
          requireInteraction: false,
        })
      }
    }
  }, [timeLeft, isRunning, mode, notificationPermission])

  const handleModeChange = (newMode: TimerModeKey) => {
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

  const formatTime = (seconds: number): string => {
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
          {(Object.entries(TIMER_MODES) as [TimerModeKey, typeof TIMER_MODES[TimerModeKey]][]).map(([key, value]) => (
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
        src="/timer-complete.mp3"
      />
    </div>
  )
}

export default App
