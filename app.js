
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
//uploading package
var formidable = require('formidable');
//sqlite
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, '/db/ebpc_document_management_system.db3'))

//to store the users
//const userData = []
// get user by username
//const findByUsername = username => userData.find(user => user.username ===username)
// app.get('/users', (req, res) =>{
//     db.all("select * from 'user'", [], (err, rows) => {
//         if (err == null) {
//             res.send(rows)
//         } else {
//             res.send(err)
//         }
//     })
// })

const queryUser = (username) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM user WHERE name = ?', [username], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                const userData = rows[0];
                resolve({
                    ...userData,
                    username: userData.name
                });
            }

        })
    })
}

//checking the username and password
passport.use(new LocalStrategy({}, async (username, password, done) => {
    const user = await queryUser(username);
    // const user = findByUsername(username)
    if(!user) {
        //console.log('User not found')
        return done(null, false, {message: 'User not found'})
    } else if (!(await bcrypt.compare(password, user.password))) {
        //console.log('Password is incorrect')
        return done(null, false, {message: 'Password is incorrect'})
    }
    return done(null, user);
}))
passport.serializeUser((user, done) => {
    done(null, user.username)
})
passport.deserializeUser(async (username, done) => {
    const user = await queryUser(username);
    return done(null, user)
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


//go to homepage if session exists
app.get('/',checkSession, (req, res) => {
    var dirContents = fs.readdirSync(folderPath)
    let dirObj = [];
    dirContents.forEach((d) => {
        dirObj.push({folderName: d});
    });
    if (dirContents == null){
        dirObj = null;
    }
    res.render('home', {layout : 'index', folders: dirObj, userName: req.user.username})
})
//go to folder page if session exists
app.get('/folder/:dir',checkSession, (req, res) => {
    let f = fs.readdirSync(path.join(folderPath, req.params.dir));
    let files = [];
    f.forEach((fl) => {
        files.push({filename: fl});
    });
    if (f == null){
        files = null;
    }
    res.render('folder', {layout : 'files', files: files, userName: req.user.username})
})
app.get('/create_folder',checkSession, (req, res) => {
    res.render('create_folder', {userName: req.user.username})
})

app.get('/upload',checkSession, (req, res) => {
    res.render('upload', {userName: req.user.username})
})

//login page
app.get('/login', (req, res) => {
    res.render('login')
})
//register page
app.get('/reg', (req, res) => {
    res.render('register', {messages: null})
})
//setting user info
app.post('/reg', async (req, res) => {
    let user = req.body
    let username = user.username
    let password = await bcrypt.hash(user.password, 10)
    db.all('SELECT name FROM user WHERE name = ?', [username], function (err, rows) {
        if (rows.length != 0) {
            //console.log('User is already exist')
            return res.render('register', {messages: "User is already exist"})
        } else if(user.password.length < 6 || user.password.length > 16) {
            //console.log('Password length should between 6 and 16')
            return res.render('register', {messages: "Password length should between 6 and 16"})
        } else if (!user.password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[\\S]{6,16}')) {
            //console.log('Password should include different case letters and numbers')
            return res.render('register', {messages: "Password should include different case letters and numbers  "})
        } else{
            db.run('INSERT INTO user(name, level, password) VALUES(?, ?, ?)', [username, 0, password], function (err) {
                if (err) {
                    return console.log('insert data error: ', err.message)
                } else {
                    res.redirect('/login')
                }
            })
        }
    })
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


