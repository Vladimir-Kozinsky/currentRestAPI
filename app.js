const upload = require("./routes/upload");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const connection = require("./db");
const express = require("express");
const config = require('config')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();

let gfs;
connection();

const conn = mongoose.connection;
conn.once("open", function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("photos");
});

app.use("/api", upload);
app.use('/api', require('./routes/auth.routes'))
app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:3000'
}));


// media routes
app.get("/file/:filename", async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.send("not found");
    }
});

app.delete("/file/:filename", async (req, res) => {
    try {
        await gfs.files.deleteOne({ filename: req.params.filename });
        res.send("success");
    } catch (error) {
        console.log(error);
        res.send("An error occured.");
    }
});

const port = config.get('port') || 5000;
app.listen(port, console.log(`SERVER STARTED ON ${port} PORT `));
