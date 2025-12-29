import { useState, useEffect } from 'react';
import './SpotifyWidget.css';

const SpotifyWidget = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState({
    name: 'Not Playing',
    artists: 'Connect Spotify'
  });
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [recentTracks, setRecentTracks] = useState([]);
  const [showRecentTracks, setShowRecentTracks] = useState(false);

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const exchangeCodeForToken = async (code) => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || window.location.origin;
    const codeVerifier = localStorage.getItem('code_verifier');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      setAccessToken(data.access_token);
      setIsConnected(true);
      localStorage.setItem('spotify_token', data.access_token);
      localStorage.removeItem('code_verifier');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedToken = localStorage.getItem('spotify_token');
      if (storedToken) {
        setAccessToken(storedToken);
        setIsConnected(true);
      }
    }
  }, []);

  useEffect(() => {
    if (accessToken && !player) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Pomodoro Timer Player',
          getOAuthToken: cb => { cb(accessToken); },
          volume: 0.5
        });

        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
        });

        spotifyPlayer.addListener('player_state_changed', state => {
          if (!state) return;
          
          setCurrentTrack({
            name: state.track_window.current_track.name,
            artists: state.track_window.current_track.artists.map(a => a.name).join(', ')
          });
          setIsPaused(state.paused);
        });

        spotifyPlayer.connect();
        setPlayer(spotifyPlayer);
      };
    }
  }, [accessToken, player]);

  const handleConnect = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || window.location.origin;
    const scopes = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read user-read-recently-played playlist-read-private playlist-read-collaborative';
    
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    localStorage.setItem('code_verifier', codeVerifier);
    
    console.log('Redirecting to Spotify with:', { clientId, redirectUri });
    
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('show_dialog', 'true');
    
    window.location.href = authUrl.toString();
  };

  const handleDisconnect = () => {
    if (player) {
      player.disconnect();
    }
    localStorage.removeItem('spotify_token');
    setAccessToken(null);
    setIsConnected(false);
    setPlayer(null);
    setIsPaused(true);
    setCurrentTrack({
      name: 'Not Playing',
      artists: 'Connect Spotify'
    });
  };

  const togglePlayPause = () => {
    if (player) {
      player.togglePlay();
    }
  };

  const nextTrack = () => {
    if (player) {
      player.nextTrack();
    }
  };

  const previousTrack = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const playLofiPlaylist = async () => {
    if (!accessToken || !deviceId) {
      alert('Spotify player not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      const playlistUri = 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn';
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          context_uri: playlistUri,
          position_ms: 0
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to play playlist:', error);
        if (error.error?.reason === 'PREMIUM_REQUIRED') {
          alert('Spotify Premium is required to play music in the app. Please upgrade your account.');
        } else {
          alert('Failed to play music. Make sure you have an active Spotify session.');
        }
      }
    } catch (error) {
      console.error('Error playing lofi beats:', error);
      alert('Error playing music. Please try again.');
    }
  };

  const fetchUserPlaylists = async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPlaylists(data.items);
        setShowPlaylists(true);
        setShowRecentTracks(false);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      alert('Failed to load playlists');
    }
  };

  const fetchRecentTracks = async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentTracks(data.items);
        setShowRecentTracks(true);
        setShowPlaylists(false);
      }
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
      alert('Failed to load recent tracks');
    }
  };

  const playPlaylist = async (playlistUri) => {
    if (!accessToken || !deviceId) {
      alert('Spotify player not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          context_uri: playlistUri,
          position_ms: 0
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to play playlist:', error);
        alert('Failed to play playlist. Make sure you have an active Spotify session.');
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
      alert('Error playing playlist. Please try again.');
    }
  };

  const playTrack = async (trackUri) => {
    if (!accessToken || !deviceId) {
      alert('Spotify player not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to play track:', error);
        alert('Failed to play track. Make sure you have an active Spotify session.');
      }
    } catch (error) {
      console.error('Error playing track:', error);
      alert('Error playing track. Please try again.');
    }
  };

  return (
    <div className={`spotify-widget ${isExpanded ? 'expanded' : ''}`}>
      {!isConnected ? (
        <button className="spotify-connect-btn" onClick={handleConnect}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>Connect Spotify</span>
        </button>
      ) : (
        <div className="spotify-player">
          <button className="spotify-toggle" onClick={() => setIsExpanded(!isExpanded)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </button>
          
          {isExpanded && (
            <div className="spotify-controls">
              <div className="now-playing">
                <div className="track-info">
                  <div className="track-name">{currentTrack.name}</div>
                  <div className="artist-name">{currentTrack.artists}</div>
                </div>
              </div>
              
              <div className="playback-controls">
                <button className="control-btn" onClick={previousTrack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                <button className="control-btn play-pause" onClick={togglePlayPause}>
                  {isPaused ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  )}
                </button>
                <button className="control-btn" onClick={nextTrack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>
              
              <button className="lofi-btn" onClick={playLofiPlaylist}>
                🎵 Play Lofi Beats
              </button>
              
              <div className="music-options">
                <button className="music-btn" onClick={fetchUserPlaylists}>
                  📚 My Playlists
                </button>
                <button className="music-btn" onClick={fetchRecentTracks}>
                  🕐 Recently Played
                </button>
              </div>

              {showPlaylists && userPlaylists.length > 0 && (
                <div className="music-list">
                  <div className="list-header">
                    <span>Your Playlists</span>
                    <button className="close-list" onClick={() => setShowPlaylists(false)}>✕</button>
                  </div>
                  <div className="list-items">
                    {userPlaylists.map(playlist => (
                      <div 
                        key={playlist.id} 
                        className="list-item"
                        onClick={() => playPlaylist(playlist.uri)}
                      >
                        <div className="item-info">
                          <div className="item-name">{playlist.name}</div>
                          <div className="item-details">{playlist.tracks.total} tracks</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showRecentTracks && recentTracks.length > 0 && (
                <div className="music-list">
                  <div className="list-header">
                    <span>Recently Played</span>
                    <button className="close-list" onClick={() => setShowRecentTracks(false)}>✕</button>
                  </div>
                  <div className="list-items">
                    {recentTracks.map((item, index) => (
                      <div 
                        key={`${item.track.id}-${index}`} 
                        className="list-item"
                        onClick={() => playTrack(item.track.uri)}
                      >
                        <div className="item-info">
                          <div className="item-name">{item.track.name}</div>
                          <div className="item-details">
                            {item.track.artists.map(a => a.name).join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button className="disconnect-btn" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotifyWidget;
