const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors()); 
app.use(express.json());

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
        // res.json({ access_token, refresh_token, expires_at });
        console.log("Got Access Token");
        // Redirect back to the frontend, passing the token as a query parameter
        const frontendUrl = `${process.env.FRONTEND_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_at=${expires_at}`;
        res.redirect(frontendUrl);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error exchanging code for token');
    }
});

app.listen(port, () => {
    console.log('Server listening on port ', port);
});