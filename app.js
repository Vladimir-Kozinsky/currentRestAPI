const upload = require("./routes/upload");
const connection = require("./db");
const express = require("express");
const config = require('config')
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')

connection();

app.use(express.json()) // for parsing application/json
//app.use(express.urlencoded({ extended: true }))

app.use("", upload);
app.use('/api', require('./routes/auth.routes'))


const port = config.get('port') || 5000;
app.listen(port, console.log(`SERVER STARTED ON ${port} PORT `));
