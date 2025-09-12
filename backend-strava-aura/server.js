const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const AthleteProfile = require('./models/AthleteProfile');
const AthleteStats = require('./models/AthleteStats');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors()); 
app.use(express.json());

// Set up Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-dev-secret-not-for-production',
    resave: false,
    saveUninitialized: true,
    cookie: { secure : false } // TODO: Set to true in production
}));

// Helper function to refresh access token
async function refreshAccessToken(req) {
    try {
        const response = await axios.post('https://www.strava.com/oauth/token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: req.session.refresh_token
        });

        const { access_token, refresh_token, expires_at } = response.data;
        
        // Update session with new tokens
        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;
        req.session.expires_at = expires_at;

        console.log('Access token refreshed successfully');
        return { access_token, refresh_token, expires_at };
    } catch (error) {
        console.error('Error refreshing access token:', error.response?.data || error.message);
        throw new Error('Failed to refresh access token');
    }
}

// Helper function to check and refresh token if needed
async function ensureValidToken(req, res) {
    const { access_token, refresh_token, expires_at } = req.session;

    if (!access_token || !refresh_token) {
        return res.status(401).json({ error: 'No authentication tokens found. Please re-authenticate.' });
    }

    // Check if token is expired (with 5 minute buffer)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (Date.now() >= (expires_at * 1000) - bufferTime) {
        console.log("Access Token expired or expiring soon, refreshing...");
        try {
            await refreshAccessToken(req);
        } catch (error) {
            return res.status(401).json({ error: 'Failed to refresh access token. Please re-authenticate.' });
        }
    }

    return null; // No error, token is valid
}

// Root Route
app.get('/', (req, res) => {
    res.send('Strava OAuth2 Proxy Backend is Running');
});

// Test Route
app.get('/api/hello', (req, res) => {
    res.send('Hello World from Server');
});

// OAuth2 Strava Route
app.get('/auth/strava', (req, res) => {
    const authorizationUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=read,activity:read`;
    res.redirect(authorizationUrl);
})


// Token exchange route
app.get('/api/auth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Authorization code is required');
    }

    try {
        const response = await axios.post('https://www.strava.com/oauth/token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code'
        });

        const { access_token, refresh_token, expires_at } = response.data;

        // Store Tokens in Session
        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;
        req.session.expires_at = expires_at;

        // Redirect to frontend without tokens in URL
        const frontendUrl = `${process.env.FRONTEND_URL}/aura`;
        res.redirect(frontendUrl);

        // Redirect back to the frontend, passing the token as a query parameter
        // const frontendUrl = `${process.env.FRONTEND_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_at=${expires_at}`;
        // res.redirect(frontendUrl);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error exchanging code for token');
    }
});

app.get('/api/profile', async (req, res) => {
    // Ensure we have a valid token
    const tokenError = await ensureValidToken(req, res);
    if (tokenError) return; // Response already sent

    // Make call to Strava API
    try {
        const profileResponse = await axios.get('https://www.strava.com/api/v3/athlete', {
            headers: {
                Authorization: `Bearer ${req.session.access_token}`
            }
        });

        const profile = new AthleteProfile(profileResponse.data);
        res.json(profile);

    } catch (err) {
        console.error('Error fetching athlete profile:', err.response?.data || err.message);
        
        if (err.response?.status === 401) {
            res.status(401).json({ error: 'Authentication failed. Please re-authenticate.' });
        } else {
            res.status(500).json({ error: 'Error fetching athlete profile' });
        }
    }
});


app.get('/api/stats/:profileId', async (req, res) => {
    const { profileId } = req.params;

    // Input validation
    if (!profileId || isNaN(profileId)) {
        return res.status(400).json({ error: 'Invalid profile ID provided' });
    }

    // Ensure we have a valid token
    const tokenError = await ensureValidToken(req, res);
    if (tokenError) return; // Response already sent

    // Make call to Strava API
    try {
        const statsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${profileId}/stats`, {
            headers: {
                Authorization: `Bearer ${req.session.access_token}`
            }
        });

        const athleteStats = new AthleteStats(statsResponse.data);
        res.json(athleteStats);

    } catch (err) {
        console.error('Error fetching athlete stats:', err.response?.data || err.message);
        
        if (err.response?.status === 401) {
            res.status(401).json({ error: 'Authentication failed. Please re-authenticate.' });
        } else if (err.response?.status === 404) {
            res.status(404).json({ error: 'Athlete not found' });
        } else {
            res.status(500).json({ error: 'Error fetching athlete stats' });
        }
    }
});

// Image proxy endpoint to bypass CORS for profile images
app.get('/api/proxy/image', async (req, res) => {
    const { url } = req.query;
    
    // Validate URL parameter
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Security: Only allow Strava CDN URLs
    const allowedDomains = [
        'dgalywyr863hv.cloudfront.net',
        'graph.facebook.com',
        'lh3.googleusercontent.com',
        'd3nn82uaxijpm6.cloudfront.net'
    ];
    
    try {
        const urlObj = new URL(url);
        if (!allowedDomains.includes(urlObj.hostname)) {
            return res.status(403).json({ error: 'Domain not allowed' });
        }
        
        // Fetch the image
        const imageResponse = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Strava-Aura/1.0'
            }
        });
        
        // Set appropriate headers
        const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
        res.set({
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:4200',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        });
        
        // Send the image data
        res.send(imageResponse.data);
        
    } catch (error) {
        console.error('Error proxying image:', error.message);
        
        if (error.code === 'ETIMEDOUT') {
            res.status(408).json({ error: 'Request timeout' });
        } else if (error.response?.status) {
            res.status(error.response.status).json({ error: 'Image fetch failed' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// SEO/Open Graph metadata endpoint
app.get('/api/seo/:athleteId', async (req, res) => {
    try {
        const { athleteId } = req.params;
        
        if (!req.session.access_token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        // Get athlete profile and stats
        const profileResponse = await axios.get('https://www.strava.com/api/v3/athlete', {
            headers: { 'Authorization': `Bearer ${req.session.access_token}` }
        });
        
        const statsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
            headers: { 'Authorization': `Bearer ${req.session.access_token}` }
        });
        
        const profile = new AthleteProfile(profileResponse.data);
        const stats = new AthleteStats(statsResponse.data);
        
        // Calculate basic scores for SEO (simplified version)
        const profileScore = calculateProfileScore(profile);
        const overallScore = Math.round((profileScore + 50) / 2); // Simplified calculation
        const grade = getGrade(overallScore);
        const rating = getRating(overallScore);
        
        // Generate SEO data
        const seoData = {
            title: `${profile.firstname} ${profile.lastname}'s Strava Aura: ${overallScore} (${grade}) - ${rating}`,
            description: `${profile.firstname} ${profile.lastname} achieved a Strava Aura score of ${overallScore} with grade ${grade}. Discover your own athletic aura with comprehensive cycling, running, and performance analytics.`,
            image: profile.profile_medium || profile.profile || '/og-image-strava.png',
            url: `/aura`,
            athleteName: `${profile.firstname} ${profile.lastname}`,
            score: overallScore,
            grade: grade,
            rating: rating,
            location: profile.city ? `${profile.city}, ${profile.state || profile.country}` : null,
            premium: profile.summit || false
        };
        
        res.json(seoData);
        
    } catch (error) {
        console.error('Error generating SEO data:', error.message);
        res.status(500).json({ error: 'Failed to generate SEO data' });
    }
});

// Helper functions for SEO endpoint
function calculateProfileScore(profile) {
    let score = 0;
    if (profile.summit) score += 10;
    if (profile.profile_medium) score += 10;
    if (profile.bio) score += 10;
    if (profile.city) score += 10;
    if (profile.id < 1000000) score += 40;
    else if (profile.id < 5000000) score += 30;
    return Math.min(score, 100);
}

function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
}

function getRating(score) {
    if (score >= 95) return 'Absolute Legend';
    if (score >= 90) return 'Elite Athlete';
    if (score >= 85) return 'Strava Superstar';
    if (score >= 80) return 'Epic Endurist';
    if (score >= 75) return 'Solid Performer';
    if (score >= 70) return 'Active Enthusiast';
    if (score >= 65) return 'Weekend Warrior';
    if (score >= 60) return 'Getting There';
    if (score >= 55) return 'Casual Movement Fan';
    if (score >= 50) return 'Beginner Plus';
    if (score >= 40) return 'Just Starting';
    return 'Couch Potato';
}

app.listen(port, () => {
    console.log('Server listening on port ', port);
});