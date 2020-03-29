const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

router.get('/:selectionType/:filterValue', async (req,res)=>{

    const selectionType = req.params.selectionType;
    const filterValue = req.params.filterValue;

    //object for queries
    const queryObjs = {
        maleMax: {
            query: {sex: 'M'},
            sort: {price: -1}
        },
        maleMin: {
            query: {sex: 'M'},
            sort: {price: 1}
        },
        femaleMax: {
            query: {sex: 'F'},
            sort: {price: -1}
        },
        femaleMin: {
            query: {sex: 'F'},
            sort: {price: 1}
        },
    };

      //ADD FILTERING CATEGORY
    if(filterValue != 'wszystkie'){
        Object.keys(queryObjs).forEach((key)=>{
            const addQuery = {};
            addQuery[selectionType] = filterValue;
            queryObjs[key].query = {
                ...queryObjs[key].query, 
                ...addQuery};
        })
    }

     // ADD FILTERING REGULAR PRICE
    //  if(regular){
    //     Object.keys(queryObjs).forEach((key)=>{
    //         const addQuery = {priceCat: 'Regular'};
    //         queryObjs[key].query = {
    //             ...queryObjs[key].query, 
    //             ...addQuery};
    //     })
    // }
    
    const url = process.env.DB_CONNECTION
    const dbName = process.env.DB_NAME;
    const collectionName = process.env.DB_COLLECTION;

    let result = {};

    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, async (error, client)=>{
        if(error){
            console.log(error)
        }else{
            const collection = client.db(dbName).collection(collectionName);

            const keys = Object.keys(queryObjs);
            for(let key of keys){
    
                const { query, sort } = queryObjs[key];
                const cursor = collection.find(query).sort(sort).limit(1);
                const oneResult = await cursor.toArray();
                
                result[key] = oneResult;
            };
            res.json(result)
            client.close();
        }
    });
});
module.exports = router;