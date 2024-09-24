const express = require('express');
const app = express();
const PORT = 3000;

// Handle CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Route for handling requests from Angular client
app.get('/api/hello', (req, res) => {
    res.json({ message: 
        'Hello from Express Server with Git!' });
});

app.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
});