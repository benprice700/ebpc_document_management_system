
//import express
const express = require('express')
const cors = require('cors')
//to create server
const app = express()
const path = require('path')
//import fs
const fs = require('fs')
const handlebars = require('express-handlebars')
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

//Test commit and push

// solve the cross domain issues
app.use(cors())
//set hbs and its folder
app.set("views",path.join(__dirname, '/views'))
app.set('view engine', 'hbs')

console.log(__dirname)

app.engine('hbs', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}))
//encode form
app.use(express.urlencoded({extended: false}))
//set root folder
app.use(express.static('public'))
app.use(flash())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.session())


const folderPath = "public/EBPC"
var dirContents = fs.readdirSync(folderPath)

let dirObj = [];

dirContents.forEach((d) => {
    dirObj.push({folderName: d});
});

//go to homepage if session exists
app.get('/',checkSession, (req, res) => {
    res.render('home', {layout : 'index', folders: dirObj, userName: req.user.username})
})
//go to folder page if session exists
app.get('/folder/:dir',checkSession, (req, res) => {
    let f = fs.readdirSync(path.join(folderPath, req.params.dir));
    let files = [];
    f.forEach((fl) => {
        files.push({filename: fl});
    });
    
    res.render('folder', {layout : 'files', files: files, userName: req.user.username})
})
//login page
app.get('/login', (req, res) => {
    res.render('login')
})
//register page
app.get('/reg', (req, res) => {
    res.render('register')
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
    res.render('login')
})

//middleware for checking if session exist
function checkSession(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.render('login')
    }
    return next()
}

//start server
app.listen(80, () => {
    console.log('server is running')
})


