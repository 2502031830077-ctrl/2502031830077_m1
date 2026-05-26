const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log("Successfully started server on port 3000");
});

app.get('/', (req, res) => {
    res.send("<h1>Hello World</h1>");
});

app.get('/about', (req, res) => {
    res.send("<h1>About Page</h1>");
});