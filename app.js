// const fetch = require('node-fetch');
// const moment = require('moment');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

//CREATE APP 
const app = express();
app.listen(3000, () => console.log("Listening at 3000"));
app.use(express.static('dist'));

const breakdownRoute = require('./routes/breakdown')
app.use('/counter', breakdownRoute)

const minmaxRoute = require('./routes/minmax');
app.use('/minmax', minmaxRoute);

const priceLevelRoute = require('./routes/priceLevel');
app.use('/pricelevel', priceLevelRoute);