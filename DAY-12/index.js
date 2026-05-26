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

app.get('/about/user', (req, res) => {
    res.send("<h1>About Users Page</h1>");
});

app.get('/user/:id', (req, res) => {
    res.send(`<h1>User Page - ID: ${req.params.id}</h1>`);
}); 


app.get('/user/:userid/book/:bookid', (req, res) => {
    res.send(`<h1>User Page - User ID: ${req.params.userid}, Book ID: ${req.params.bookid}</h1>`);
});


app.get('/search', (req, res) => {
    const name = req.query.name;
    const age = req.query.age;
    const city = req.query.city;
    res.send(`<h1>Search Results - Name: ${name}, Age: ${age}, City: ${city}</h1>`);
});




app.get('/', (req, res) => {
    res.json({ name: 'Rajan parmar', age: 25, city: 'Ahmedabad' });
});

app.get('/about', (req, res) => {
    res.redirect('https://www.google.com');
});

app.set('view engine', 'ejs');

app.get('/about', (req, res) => {
    res.render('..'); 
});


app.get('/download', (req, res) => {
    res.download('./files/shortcuts.pdf');
});