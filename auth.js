const passport = require('passport')
const bcrypt = require('bcrypt')

module.exports = function (app, db, collection) {
//serialization and app.listen
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
      collection.findOne(
        {_id: new ObjectID(id)},
          (err, doc) => {
            done(null, doc);
          }
      );
    });

    passport.use(new LocalStrategy(
      function(username, password, done) {
        collection.findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
          return done(null, user);
        });
      }
    ));
  }