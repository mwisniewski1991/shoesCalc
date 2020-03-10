const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
require('dotenv/config');


//GET DATA FOR BREAKDOWN SECTION
router.get('/:chartType/:selectionType/:filterValue', async (req, res) => {

    const chartType = req.params.chartType;
    const selectionType = req.params.selectionType;
    const filterValue = req.params.filterValue;

    const firstValue = chartType === 'sexBreakdown' ? "F" : 'Regular'
    const secondValue = chartType === 'sexBreakdown' ? "M" : 'Special'
  
    const firstPartQuery = chartType === 'sexBreakdown' ? {'sex':'F'} : {'priceCat':'Regular'}
    const secondPartQuery = chartType === 'sexBreakdown' ? {'sex':'M'} : {'priceCat':'Special'}
  
    const firstQueryMethod = {...firstPartQuery}
    const secondQueryMethod = {...secondPartQuery}
  
    if(filterValue != "wszystkie"){
      firstQueryMethod[selectionType] = filterValue
      secondQueryMethod[selectionType] = filterValue
    };
  
    const url = process.env.DB_CONNECTION
    const dbName = "shoesCalc";
    const collectionName = "collection";

    let result = {};

    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, async (error, client)=>{
      if(error){
          console.log(error)
      }else{
          const collection = client.db(dbName).collection(collectionName);

          const cursorFirst = collection.find(firstQueryMethod);
          const cursorSecond = collection.find(secondQueryMethod);
  
          const counterFirst = await cursorFirst.count();
          const counterSecond = await cursorSecond.count();
  
          result[firstValue] = counterFirst
          result[secondValue] = counterSecond

          res.json(result)
          client.close();
      }
    });
});
module.exports = router;