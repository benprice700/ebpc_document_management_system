const express = require('express')
//creat a user
const user = express.Router()

//login function
user.post('/login', (req, res) =>{
    //get the param
    let user = req.body
    //check if param is null
    if (!user.username || !user.password) {
        return res.json({state:1, msg:'username and password cannot be null'})
    }
    //check username and password
    if (user.username !== 'admin' || user.password !== 'admin') {
        return res.json({state:1, msg:'username or password is incorrect'})
    }
    //login success
    res.json({state:0, msg:'Login success'})
})
//register function
user.post('/reg', (req, res) =>{
    //get the param
    let user = req.body
    //check if param is null
    if (!user.username || !user.password) {
        return res.json({state:1, msg:'username and password cannot be null'})
    }

    //login success
    res.json({state:0, msg:'Register success'})
})

module.exports = user

