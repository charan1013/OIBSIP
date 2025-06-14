require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const socketIO = require('socket.io'); 
const PORT = process.env.PORT || 3000;
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const Emitter = require('events');




// Database Connection
const mongoUrl = process.env.MONGO_CONNECTION_URL;
mongoose.connect(mongoUrl);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Database connected...');
});
connection.on('error', (err) => {
  console.log('Connection failed...', err);
});


// Session Configuration 
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

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);


//Flash Messages
app.use(flash());




//Static Files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});


app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');


const initRoutes = require('./routes/web.js');

// Initialize all your defined routes
initRoutes(app);

// 404 handler (should come after all route definitions)
app.use((req, res) => {
  res.status(404).render('errors/404');
});



// Start Server 
const server = app.listen(PORT , () => {
            console.log(`Listening on port ${PORT}`)
        })


// Socket
const io = require('socket.io')(server)
io.on('connection', (socket) => {
      
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})
