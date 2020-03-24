require('dotenv').config()
const express = require('express')
const { join } = require('path')
const app = express()

const passport = require('passport')
const { Strategy } = require('passport-local')
const {User} = require('./models')

const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt')


const mongoURI = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : 'mongodb://localhost/skeletondb'
const mongoose = require('mongoose')
const conn = mongoose.createConnection(mongoURI, {
  // these methods are rarely used
  useNewUrlParser: true,
  useUnifiedTopology: true
})

//middleware
app.use(express.static(join(__dirname, 'client', 'build')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

passport.use(new JWTStrategy({
  //we'll pass the token using HEADERS.
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //second, we pass the Secret (to help unsign that token)
  secretOrKey: process.env.SECRET 
}, ({id}, cb)=>
  User.findById(id)
    .then(user => cb(null, user))
    .catch(e=>cb(e))
)
)

//passport boilerplate code
passport.use(new Strategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//DEPLOYING TO HEROKU
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"))
}

//routes
require('./routes')(app)

//Catches all; sends any routes NOT found in the server directly into our home.
app.get('*', (req, res) => res.sendFile(join(__dirname, 'client', 'build', 'index.html')))

//connect to the database and listen on a port
require('mongoose')
  .connect(process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : 'mongodb://localhost/skeletondb', {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(process.env.PORT || 3001)
  })
  .catch(e => console.error(e))
