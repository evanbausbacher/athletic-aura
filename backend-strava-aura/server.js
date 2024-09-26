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
    secret: '1Um8mYy1V7jkfnQI0ycdLu35dTJb6Mja',
    resave: false,
    saveUninitialized: true,
    cookie: { secure : false } // TODO: Set to true in production
}));

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
    const {access_token, refresh_token, expires_at } = req.session;

    // Check Expiration
    if (Date.now() >= expires_at * 1000){
        console.log("Access Token expired, refresing...")

        // this.refresh
    }

    // Make call to Strava API
    try{
        const profileResponse = await axios.get('https://www.strava.com/api/v3/athlete', {
            headers: {
                Authorization : `Bearer ${req.session.access_token}`
            }
        });

        const profile = new AthleteProfile(profileResponse.data);

        res.json(profile);
    }
    catch (err){
        console.error('Error fetching athlete profile', err);
        res.status(500).send('Error fetching athlete profile');
    }

});


app.get('/api/stats/:profileId', async (req ,res) => {
    const { profileId } = req.params;
    const {access_token, refresh_token, expires_at } = req.session;

    // Check Expiration
    if (Date.now() >= expires_at * 1000){
        console.log("Access Token expired, refresing...")

        // this.refresh
    }

    // Make call to Strava API
    try{
        const statsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${profileId}/stats`, {
            headers: {
                Authorization : `Bearer ${req.session.access_token}`
            }
        });

        const athleteStats = new AthleteStats(statsResponse.data);

        res.json(athleteStats);
    }
    catch (err){
        console.error('Error fetching athlete stats', err);
        res.status(500).send('Error fetching athlete stats');
    }
});

app.listen(port, () => {
    console.log('Server listening on port ', port);
});