const express = require("express");
const { fstat } = require("fs");
const path = require("path")

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
//app.use(express.static('public'));

const multer = require("multer");
const upload = multer({ dest: "upload/" });

// app.post("/upload_files", uploadFiles);
function uploadFiles(req, res) {
    console.log(req.body);
}
app.listen(5000, () => {
    console.log(`Server started...`);
});

app.post("/upload_files", upload.single("myfile"), uploadFiles);

function uploadFiles(req, res) {
    console.log(req.body);
    console.log(JSON.stringify(req.file));
    const fs = require ("fs");
    fs.renameSync(`./upload/${req.file.filename}`,`./upload/${req.file.originalname}`);
    res.json({ message: "Successfully uploaded files" });
}