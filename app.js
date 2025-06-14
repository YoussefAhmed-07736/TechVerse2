const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); 
const MainRoutes = require('./routes/MainRoutes');
const UserRoutes = require('./routes/UserRoutes');
const AdminRoutes = require('./routes/AdminRoutes');


const { isAuthenticated, isAdmin } = require('./middleware/authMiddleware');

const session = require("express-session");
const cookieParser = require("cookie-parser"); 
const app = express();
const MongoStore = require("connect-mongo");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Youssef:YoussefAdmin@webproject.1c1yiix.mongodb.net/WebProject?retryWrites=true&w=majority&appName=WebProject";

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'yourFallbackSecret',
        resave : false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: MONGODB_URI,
            ttl: 60 * 60 * 24 * 7,
            autoRemove: "interval",
            autoRemoveInterval: 10,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        },
    })
);


app.use((req, res, next) => {
    if (req.session.userEmail) {
        res.locals.user = {
            email: req.session.userEmail,
            role: req.session.role
        };
    } else {
        res.locals.user = null; 
    }


    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


const port = process.env.PORT || 3000; 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', isAuthenticated, isAdmin, AdminRoutes);
app.use('/users', UserRoutes);
app.use('/', MainRoutes);


mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error for default connection:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
});


process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});