//import express
const express = require('express')
const cors = require('cors')
//to create server
const app = express()
const path = require('path')
// for hashing the password
const bcrypt = require('bcrypt')
// flash for getting the message from nodejs
const flash = require('express-flash')
const session = require('express-session')
//passport related
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

//to store the users
const userData = []
// get user by username
const findByUsername = username => userData.find(user => user.username ===username)

//checking the username and password
passport.use(new LocalStrategy({}, async (username, password, done) => {
    const user = findByUsername(username)
    if(!user) {
        return done(null, false, {message: 'User not found'})
    } else if (!(await bcrypt.compare(password, user.password))) {
        return done(null, false, {message: 'Password is incorrect'})
    }
    return done(null, user)
}))
passport.serializeUser((user, done) => {
    done(null, user.username)
})
passport.deserializeUser((username, done) => {
    return done(null, findByUsername(username))
})

// solve the cross domain issues
app.use(cors())
//set ejs and its folder
app.set("views","public")
app.set('view-engine', 'ejs')
//encode form
app.use(express.urlencoded({extended: false}))
//set root folder
app.use(express.static(path.join(__dirname, './public')))
app.use(flash())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.session())

//middleware for checking if session exist
function checkSession(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.render('login.ejs')
    }
    return next()
}

//go to homepage if session exist
app.get('/',checkSession, (req, res) => {
    //res.redirect('./home.html')
    //res.render('./home.html', {username: req.user.username})
    res.render('home.ejs', {username: req.user.username})
})
//login page
app.get('/login', (req, res) => {
    res.render('login.ejs')
})
//register page
app.get('/reg', (req, res) => {
    res.render('register.ejs')
})
//setting user info
app.post('/reg', async (req, res) => {
    let user = req.body
    userData.push({
        username: user.username,
        password: await bcrypt.hash(user.password, 10),
        level:0,
        isDeleted:0
    })
    res.redirect('/login')
})
//login function
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
//back to login page if click logout
app.get('/logout', (req, res) => {
    res.render('login.ejs')
})

//start server
app.listen(80, () => {
    console.log('server is running')
})