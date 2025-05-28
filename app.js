require('dotenv').config();

const express = require('express');

const cors = require('cors');

const bodyParser = require('body-parser');

const app = express();

// const port = process.env.SERVER_PORT || 8080;

const errorHandler = require('./middleware/errorHandler');

const handleResult = require('./middleware/handleResult');

const router = require('./routes');

// 目前全開放
app.use(cors());

app.use(bodyParser.json());

app.use('/', router);

app.set('view engine', 'ejs');

app.use(handleResult);

app.use(errorHandler);

module.exports = app;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
