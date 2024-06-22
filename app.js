const express = require('express');
const bodyParser = require('body-parser');
const { connectDb } = require('./config/db');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const app = express();

connectDb();

app.use(bodyParser.json());

app.use('/api', require('./routes/userRoutes'));

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server running on PORT: ${port}`))

module.exports = app; 