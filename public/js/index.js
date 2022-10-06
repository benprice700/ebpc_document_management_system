function home(){location.href = '/'}

function logout(){location.href = '/logout'}

function createFolder(){location.href='/create_folder'}

function upload(){location.href="/upload"}

function files(value){
    location.href = '/folder/' + value
}

function makeDir(){
    const fs = require('fs');
    const path = require('path');
    
    fs.mkdir(path.join(__dirname, 'test'), (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully!');
    });
}