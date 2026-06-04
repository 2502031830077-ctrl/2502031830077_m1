const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 5500;

// --- Middlewares & View Engine Setup ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to share database connection state with views
app.use((req, res, next) => {
    res.locals.dbMode = mongoose.connection.readyState === 1 ? 'MongoDB' : 'JSON File';
    next();
});

// --- MongoDB Local Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contactdb';
const JSON_FILE_PATH = path.join(__dirname, 'contacts.json');

// Disable query buffering to prevent timeouts if DB is down
mongoose.set('bufferCommands', false);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB successfully!');
    // Seed MongoDB if empty
    await seedDatabase();
})
.catch(err => {
    console.warn('\n======================================================');
    console.warn('WARNING: MongoDB is not running or not installed.');
    console.warn('FALLBACK MODE ENABLED: Running in Local JSON File mode.');
    console.warn('All data will be saved to: ' + JSON_FILE_PATH);
    console.warn('======================================================\n');
});

// --- Database Seeding Helper ---
const defaultContacts = [
    { firstName: "Alfred", lastName: "Kuhlman", email: "alfred@test.com", phone: "98989898", address: "123 Main Street, Springfield" },
    { firstName: "Frederick", lastName: "Jerde", email: "frederick@test.com", phone: "54545454", address: "456 Oak Road, Rivertown" },
    { firstName: "Joannie", lastName: "McLaughlin", email: "joannie@test.com", phone: "75757575", address: "789 Pine Avenue, Lakeshore" },
    { firstName: "Odie", lastName: "Koss", email: "odie@test.com", phone: "64646464", address: "321 Elm Boulevard, Hill Valley" },
    { firstName: "Edna", lastName: "Ondrickka", email: "edna@test.com", phone: "58595858", address: "654 Maple Drive, Greendale" }
];

async function seedDatabase() {
    try {
        const count = await Contact.countDocuments();
        if (count === 0) {
            console.log('Seeding initial contacts to MongoDB database...');
            await Contact.insertMany(defaultContacts);
            console.log('MongoDB database seeded successfully!');
        }
    } catch (error) {
        console.error('Error seeding MongoDB:', error.message);
    }
}

// --- DUAL MODE DATABASE HELPERS (MongoDB + JSON Fallback) ---

// 1. Get All Contacts
async function getAllContacts() {
    if (mongoose.connection.readyState === 1) {
        try {
            return await Contact.find().sort({ createdAt: -1 });
        } catch (e) {
            console.error('MongoDB query error, falling back to JSON...', e.message);
        }
    }
    
    // JSON Fallback
    if (!fs.existsSync(JSON_FILE_PATH)) {
        // Seed JSON defaults
        const seededList = defaultContacts.map((contact, index) => ({
            _id: `507f1f77bcf86cd79943901${index + 1}`,
            ...contact,
            createdAt: new Date().toISOString()
        }));
        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(seededList, null, 2));
        return seededList;
    }
    const data = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    return JSON.parse(data);
}

// 2. Get Contact By ID
async function getContactById(id) {
    if (mongoose.connection.readyState === 1) {
        try {
            return await Contact.findById(id);
        } catch (e) {
            console.error('MongoDB query error, falling back to JSON...', e.message);
        }
    }
    
    const contacts = await getAllContacts();
    return contacts.find(c => c._id === id);
}

// 3. Create Contact
async function createContact(contactData) {
    if (mongoose.connection.readyState === 1) {
        try {
            const newContact = new Contact(contactData);
            return await newContact.save();
        } catch (e) {
            console.error('MongoDB query error, falling back to JSON...', e.message);
        }
    }
    
    const contacts = await getAllContacts();
    const newContact = {
        _id: new mongoose.Types.ObjectId().toString(), // Generate a valid MongoDB ObjectId hex string
        ...contactData,
        createdAt: new Date().toISOString()
    };
    contacts.unshift(newContact); // New items first
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(contacts, null, 2));
    return newContact;
}

// 4. Update Contact
async function updateContact(id, contactData) {
    if (mongoose.connection.readyState === 1) {
        try {
            return await Contact.findByIdAndUpdate(id, contactData, { new: true, runValidators: true });
        } catch (e) {
            console.error('MongoDB query error, falling back to JSON...', e.message);
        }
    }
    
    const contacts = await getAllContacts();
    const index = contacts.findIndex(c => c._id === id);
    if (index === -1) return null;
    contacts[index] = { ...contacts[index], ...contactData };
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(contacts, null, 2));
    return contacts[index];
}

// 5. Delete Contact
async function deleteContact(id) {
    if (mongoose.connection.readyState === 1) {
        try {
            return await Contact.findByIdAndDelete(id);
        } catch (e) {
            console.error('MongoDB query error, falling back to JSON...', e.message);
        }
    }
    
    let contacts = await getAllContacts();
    const contactToDelete = contacts.find(c => c._id === id);
    if (!contactToDelete) return null;
    contacts = contacts.filter(c => c._id !== id);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(contacts, null, 2));
    return contactToDelete;
}

// --- Route Handlers ---

// 1. READ - All Contacts List
app.get('/', async (req, res) => {
    try {
        const contacts = await getAllContacts();
        res.render('index', { contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// 2. CREATE - Render Add Page
app.get('/add', (req, res) => {
    res.render('add');
});

// 2. CREATE - Handle Add Submission
app.post('/add', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address } = req.body;
        await createContact({ firstName, lastName, email, phone, address });
        res.redirect('/');
    } catch (error) {
        console.error('Error adding contact:', error.message);
        res.status(400).send('Bad Request: ' + error.message);
    }
});

// 3. READ - Render Details Page
app.get('/view/:id', async (req, res) => {
    try {
        const contact = await getContactById(req.params.id);
        if (!contact) {
            return res.status(404).send('Contact not found');
        }
        res.render('view', { contact });
    } catch (error) {
        console.error('Error fetching contact details:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// 4. UPDATE - Render Edit Form
app.get('/edit/:id', async (req, res) => {
    try {
        const contact = await getContactById(req.params.id);
        if (!contact) {
            return res.status(404).send('Contact not found');
        }
        res.render('edit', { contact });
    } catch (error) {
        console.error('Error loading edit form:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// 4. UPDATE - Handle Edit Submission
app.post('/edit/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address } = req.body;
        const contact = await updateContact(req.params.id, { firstName, lastName, email, phone, address });
        if (!contact) {
            return res.status(404).send('Contact not found');
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error updating contact:', error.message);
        res.status(400).send('Bad Request: ' + error.message);
    }
});

// 5. DELETE - Remove Contact
app.get('/delete/:id', async (req, res) => {
    try {
        const contact = await deleteContact(req.params.id);
        if (!contact) {
            return res.status(404).send('Contact not found');
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting contact:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// --- Server Startup ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your web browser`);
});
