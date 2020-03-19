'use strict';

const express     = require('express');
//const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
require('dotenv').config()
const mongo = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const LocalStrategy = require('passport-local');

const app = express();

fccTesting(app); //For FCC testing purposes
app.set('view engine', 'pug')
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
//app.use('/public', express.static(process.cwd() + '/public'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
 
mongo.connect(process.env.DATABASE, (err, client) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
    console.log('Successful database connection');

    const db = client.db("mflix");

    //serialization and app.listen
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
      db.collection('users').findOne(
        {_id: new ObjectID(id)},
          (err, doc) => {
            done(null, doc);
          }
      );
    });

    passport.use(new LocalStrategy(
      function(username, password, done) {
        db.collection('users').findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (password !== user.password) { return done(null, false); }
          return done(null, user);
        });
      }
    ));
  }
});


app.get('/', (req, res) => {
    res.render('pug/index', {title: 'Hello', message: 'Please login', showLogin: true})
  });

app.post('/login', passport.authenticate('local', {failureRedirect: '/'}), (req, res)=>{
  res.redirect('/profile')
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

app.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('pug/profile', {username: req.user.username})
})

app.get('/logout', (req, res)=>{
  req.logout()
  res.redirect('/')
})

app.use((req, res, next) => {
  res.status(404).type('text').send('Not found')
})

const PORT = 3000 || process.env.PORT
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
