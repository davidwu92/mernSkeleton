const { User } = require('../models')
const jwt = require('jsonwebtoken')
const passport = require('passport')

module.exports = app =>{
    // Register new user
    app.post('/users', (req, res) => {
      const { username, email } = req.body
      User.register(new User({username, email}), req.body.password,
        e=>{
          if (e){console.error(e)}
          res.sendStatus(200)
        }
      )
  })
  
  // Login route
  app.post('/login', (req, res) => {
    User.authenticate()(req.body.username, req.body.password, (e, user)=>{
      if(e){console.error(e)}
      res.json(user ? {token: jwt.sign({id:user._id}, process.env.SECRET)
      } : user)
    })
  })

  //GET USER INFO (for login)
  app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { _id } = req.user
    User.findById(_id)
      .then(user => res.json(user)) //only serve up this array to front end.
      .catch(e => console.error(e))
  })
  
    // EDIT COLOR PREFERENCES
    app.put('/users/:id', (req, res) => {
      User.findByIdAndUpdate(req.params.id, { $set: req.body })
        .then(() => res.sendStatus(200))
        .catch(e => console.error(e))
    })
}