const express = require('express');
const mongoose = require('mongoose');
const Contact = require("./models/conect-models");

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/contact-crud', {
  serverSelectionTimeoutMS: 2000
})
  .then(() => console.log("database connected"))
  .catch((error) => console.error("database connection failed:", error.message));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ _id: -1 });
    res.render('home', { contacts });
  } catch (error) {
    res.status(500).send("Unable to load contacts. Please make sure MongoDB is running.");
  }
});

app.get('/add-contact', (req, res) => {
  res.render('add-contact');
});

app.post('/add-contact', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/show-contact/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).send('Contact not found');
    }
    res.render('show-contact', { contact });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/update-contact/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).send('Contact not found');
    }
    res.render('update-contact', { contact });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/update-contact/:id', async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/delete-contact/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
