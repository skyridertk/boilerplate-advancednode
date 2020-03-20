const bcrypt = require('bcrypt')
const passport = require('passport')

module.exports = function (app, db, collection) {
app.get('/', (req, res) => {
    res.render('pug/index', {title: 'Hello', message: 'Please login', showLogin: true, showRegistration: true})
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

app.post('/register', (req, res, next) => {
    console.log(req.body)
    collection.findOne({ username: req.body.username }, function(err, user) {
      if (err) {
        console.log('1')
        next(err);
      } else if (user) {
        console.log('2')
        res.redirect('/');
      } else {
        console.log('3')
        var hash = bcrypt.hashSync(req.body.password, 12);
        db.collection('users').insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              next(null, user);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile')
    }
  )

  app.use((req, res, next) => {
  res.status(404).type('text').send('Not found')
})
}