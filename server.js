'use strict';

const express     = require('express');
//const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
require('dotenv').config()
const mongo = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const routes = require('./routes.js')
const auth = require('./auth.js')

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

let db
let collection

mongo.connect(process.env.DATABASE, (err, client) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
    console.log('Successful database connection');

    db = client.db("mflix")
    collection = db.collection("users")

    auth(app, db, collection)
    routes(app, db, collection)
    const PORT = 3000 || process.env.PORT
    app.listen(PORT, () => {
      console.log("Listening on port " + PORT);});

client.close()

}});



