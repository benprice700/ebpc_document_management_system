//import express
const express = require('express')
const cors = require('cors')
//to create server
const app = express()
const path = require('path')

// solve the cross domain issues
app.use(cors())
//encode form
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, './public')))
//add router
const router = require('./router/user')
app.use('/user', router)
//start server
app.listen(80, () => {
    console.log('server is running')
})