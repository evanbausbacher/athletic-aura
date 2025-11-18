# 🔥 Athletic Aura

A full-stack web application that analyzes your Strava data and generates a gamified "aura score" - because your athletic achievements deserve more than just kudos.

## What's Your Athletic Aura?

Athletic Aura evaluates athletes across five key categories, transforming raw data into meaningful insights with a healthy dose of personality:

🏆 **Profile Completeness** - Are you a premium legend or still rocking that default avatar?  
🚴 **Cycling Score** - From weekend warrior to Tour de France wannabe  
🏃 **Running Score** - Whether you're chasing PRs or just chasing the ice cream truck    
⛰️ **Epic Score** - Your biggest adventures and most ridiculous climbs  

Each category comes with custom achievements, witty rating labels, and perks that actually make you smile when you see your data.

## Tech Stack

**Frontend:** Angular 17 + TypeScript + Tailwind CSS + Chart.js  
**Backend:** Node.js + Express + Strava API  
**Features:** OAuth2 authentication, responsive design, interactive data visualization

## The Experience

- **Smart Authentication** - Seamless Strava OAuth integration with proper token management
- **Interactive Dashboard** - Your scores come alive with animated charts and progress bars  
- **Mobile-First Design** - Looks great whether you're checking post-ride or post-couch
- **Data Visualization** - Radar charts and bar graphs that actually tell your athletic story
- **Achievement System** - Earn titles like "Cycle Daddy" or "Prehistoric User" (yes, really)

## Local Development

### Prerequisites
- Node.js 18+
- Strava API application ([create one here](https://www.strava.com/settings/api))

### Setup
```bash
# Clone and setup backend
cd backend-strava-aura
npm install
cp .env.example .env  # Add your Strava API credentials
node server.js

# Setup frontend (new terminal)
cd frontend-strava-aura/strava-aura
npm install
npm start
```

Visit `http://localhost:4200` and connect your Strava account to see your aura unfold.

## Architecture Highlights

- **Robust Backend**: Complete OAuth2 flow with automatic token refresh and comprehensive error handling
- **Modern Frontend**: Angular 17 with reactive forms, custom animations, and mobile-optimized UI
- **Smart Scoring**: Sophisticated algorithm that evaluates 30+ data points across multiple sports
- **Production Ready**: ESLint + Prettier, comprehensive test suite, and deployment-ready configuration

## Why This Matters

This was a practical and fun way to continue my Angular development skills. I learned node.js backend and got to create a fun application my friends and I would enjoy. 

The scoring algorithm is goofy and fun, the UI is pretty minimal but uses cool components for animations, graphs, and social sharing. It could catch on and be a trendy thing in the fitness community for like, 7 days idk. 

---

*Built with goofiness and way too much time analyzing Strava API documentation*
