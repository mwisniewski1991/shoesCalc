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




app.get('/total', async(req,res)=>{
  console.log('TOTAL')

  try{

    const url = process.env.DB_CONNECTION
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    client.connect( async (err) => {

      const collection = client.db("test").collection("testCol");
      // perform actions on the collection object

      const queryMethod = {};
      const cursor = collection.find(queryMethod);

      const allValues = await cursor.toArray();

      allValues.forEach((value) => {
        delete value._id
        delete value.link;
        delete value.nameSecond;
        delete value.nameFirst;
        delete value.oldPrice;
        delete value.timestamp;
        delete value.discount;

      })

      res.json(allValues);
      
      if(err){
        console.log(err)
      };
  
      client.close();
    });



  }catch(err){
    console.log(err);
  }
})