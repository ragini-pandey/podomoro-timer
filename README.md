# 🍅 Pomodoro Timer

A beautiful, feature-rich Pomodoro timer web application with dynamic backgrounds, Spotify integration, and customizable settings. Built with React and Vite for a smooth, distraction-free productivity experience.

## ✨ Features

- **⏰ Pomodoro Timer** - Classic 25/5/15 minute work and break intervals
- **🎨 Dynamic Backgrounds** - Choose from curated high-quality wallpapers across multiple categories (Nature, Lakes, Ocean, City, Desert, Roads)
- **🎵 Spotify Integration** - Connect your Spotify account and control playback directly from the timer
- **⚙️ Customizable Settings** - Personalize your experience with easy-to-use settings widget
- **🔔 Audio Notifications** - Get notified when your timer completes
- **📊 Visual Progress** - Beautiful circular progress indicator with gradient styling
- **🎯 Three Timer Modes**:
  - **Pomodoro**: 25 minutes of focused work
  - **Short Break**: 5 minutes of rest
  - **Long Break**: 15 minutes of extended rest

## 🧠 What is the Pomodoro Technique?

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into focused intervals, traditionally 25 minutes in length, separated by short breaks. The name "Pomodoro" comes from the Italian word for tomato, inspired by the tomato-shaped kitchen timer Cirillo used as a university student. This simple yet powerful method has helped millions of people worldwide overcome procrastination and achieve their goals with less stress.

### How It Works

1. **Choose a task** you want to work on
2. **Set the timer** to 25 minutes (one "Pomodoro")
3. **Work on the task** with full focus until the timer rings
4. **Take a short break** (5 minutes) to recharge
5. **Repeat** the process
6. After **4 Pomodoros**, take a longer break (15 minutes)

### Why It's Effective

- **🎯 Eliminates distractions** - Knowing you only need to focus for 25 minutes makes it easier to resist interruptions
- **🧘 Reduces mental fatigue** - Regular breaks prevent burnout and maintain high performance
- **⚡ Creates urgency** - Time constraints boost focus and productivity
- **📊 Improves estimation** - Track how many Pomodoros tasks take to better plan your work
- **🔄 Establishes rhythm** - Build a sustainable work pattern that maximizes productivity

### The Science Behind It

The technique leverages several psychological principles:
- **Time-boxing**: Limiting work to fixed periods prevents perfectionism and procrastination
- **Structured breaks**: Regular rest prevents cognitive overload and improves retention
- **Flow state**: 25 minutes is optimal for entering deep focus without overwhelming commitment
- **Positive reinforcement**: Completing Pomodoros provides regular achievement signals

This timer app implements the classic Pomodoro Technique while adding modern features like beautiful environments and music integration to enhance your focus experience.

## 📸 Screenshots

### Pomodoro Timer in Action
![Pomodoro Timer](/public/screenshot-timer.png)
*Focus mode with circular progress indicator and timer controls*

### Wallpaper Settings
![Wallpaper Settings](/public/screenshot-wallpaper.png)
*Browse and select from beautiful background categories*

### Spotify Connection
![Spotify Integration](/public/screenshot-spotify.png)
*Control your music without leaving the timer*

## 🚀 Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Lightning-fast build tool and dev server
- **CSS3** - Custom styling with animations
- **Spotify Web API** - Music playback integration
- **Unsplash Images** - High-quality background imagery

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Spotify account (for music features)
- Spotify Developer App credentials

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd podomoro-timer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Spotify API Configuration
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_REDIRECT_URI=http://127.0.0.1:5173/
   ```

4. **Get Spotify API Credentials**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://127.0.0.1:5173/` to Redirect URIs
   - Copy your Client ID to the `.env` file

5. **Add screenshots** (optional)
   
   Place your screenshot images in the `public/` folder:
   - `screenshot-timer.png` - Pomodoro timer in action
   - `screenshot-wallpaper.png` - Wallpaper settings
   - `screenshot-spotify.png` - Spotify connection

## 🎮 Usage

### Development Mode

Start the development server:
```bash
npm run dev
```

The app will be available at `http://127.0.0.1:5173/`

### Production Build

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Using the Timer

1. **Select a mode**: Click on Pomodoro, Short Break, or Long Break
2. **Start the timer**: Click the "start" button
3. **Pause if needed**: Click "pause" to temporarily stop
4. **Reset**: Click "reset" to return to the starting time
5. **Change background**: Click the settings icon to browse wallpapers
6. **Connect Spotify**: Click the Spotify widget to authenticate and control music

## 🎨 Customization

### Timer Durations

Edit the durations in [`src/constants.js`](src/constants.js):

```javascript
export const TIMER_MODES = {
  POMODORO: { label: 'pomodoro', duration: 25 * 60 },
  SHORT_BREAK: { label: 'short break', duration: 5 * 60 },
  LONG_BREAK: { label: 'long break', duration: 15 * 60 }
}
```

### Background Collections

Add or modify background categories in [`src/constants.js`](src/constants.js):

```javascript
export const BACKGROUNDS = {
  nature: [/* array of image URLs */],
  lakes: [/* array of image URLs */],
  // Add your own categories...
}
```

### Styling

- Main app styles: [`src/App.css`](src/App.css)
- Background slider: [`src/BackgroundSlider.css`](src/BackgroundSlider.css)
- Spotify widget: [`src/SpotifyWidget.css`](src/SpotifyWidget.css)
- Settings widget: [`src/SettingsWidget.css`](src/SettingsWidget.css)

## 📁 Project Structure

```
podomoro-timer/
├── public/              # Static assets
├── src/
│   ├── assets/         # Image assets
│   ├── App.jsx         # Main application component
│   ├── App.css         # Main application styles
│   ├── BackgroundSlider.jsx    # Background selection component
│   ├── BackgroundSlider.css    # Background slider styles
│   ├── SpotifyWidget.jsx       # Spotify integration component
│   ├── SpotifyWidget.css       # Spotify widget styles
│   ├── SettingsWidget.jsx      # Settings panel component
│   ├── SettingsWidget.css      # Settings widget styles
│   ├── constants.js    # Timer modes and background URLs
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── .env                # Environment variables (not in repo)
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## 🔧 Configuration

### Vite Configuration

The project uses Vite for fast development and optimized builds. Configuration can be found in [`vite.config.js`](vite.config.js).

### ESLint

Code quality is maintained with ESLint. Configuration in [`eslint.config.js`](eslint.config.js).

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Background images from [Unsplash](https://unsplash.com)
- Spotify Web API for music integration
- Inspired by the Pomodoro Technique by Francesco Cirillo

## 💡 Tips for Maximum Productivity

1. **Focus fully** during Pomodoro sessions - avoid distractions
2. **Take breaks seriously** - step away from your screen
3. **Customize your environment** - choose backgrounds that inspire you
4. **Use music wisely** - ambient or instrumental works best for focus
5. **Track your pomodoros** - aim for 8-12 per day for sustained productivity

---

Made with ❤️ for productivity enthusiasts