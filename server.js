require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport')



// -------------------- Database Connection --------------------
const mongoUrl = 'mongodb://localhost:27017/pizza';
mongoose.connect(mongoUrl);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Database connected...');
});
connection.on('error', (err) => {
  console.log('Connection failed...', err);
});




// -------------------- Session Configuration --------------------
app.use(session({
  secret: process.env.COOKIE_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoDbStore.create({
    mongoUrl: mongoUrl,
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

//passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());



// -------------------- Flash Messages --------------------
app.use(flash());




// -------------------- Static Files --------------------

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

//globalmiddleware
app.use((req, res, next)=> {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// -------------------- Set Template Engine --------------------
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

// -------------------- Routes --------------------
const initRoutes = require('./routes/web.js');
initRoutes(app);

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
