const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const d3 = require('d3');
require('dotenv/config');

const calcBoxPlotData = (data, x, y) =>{
    const transformedData = d3.nest()
    .key((d) => d[x])
    .rollup((d) => {
        const q1 = d3.quantile(d.map((g) => g[y]).sort(d3.ascending), .25); //DONE
        const median = d3.quantile(d.map((g) => g[y]).sort(d3.ascending), .5); //DONE
        const q3 = d3.quantile(d.map((g) => g[y]).sort(d3.ascending), .75); //DONE

        //count MAX and MIN without outliers, need to count few values before calc
        const interQuantileRange = q3 - q1;
        const minValues = q1 - 3 * interQuantileRange;
        const maxValues = q3 + 3 * interQuantileRange;

        const countMinOut = d.filter((g) => g.price <= minValues).length;
        const countMaxOut = d.filter((g) => g.price >= maxValues).length;

        const min = d3.min(d.slice(countMinOut).map((g)=>g[y])); //cut min outliers to get min value
        const max = d3.max(d.slice(0, d.length-countMaxOut).map((g)=>g[y])); //cut max outliers to get max value

        const outliersMinArr = d.filter((g) => g[y] <= minValues).slice(0,30);
        const outliersMaxArr = d.filter((g) => g[y] >= maxValues).slice(d.filter((g) => g[y] >= maxValues).length-30);

        const outliersMin = outliersMinArr.length === 0 ? null : d3.min(outliersMinArr.map((g) => g[y]));
        const outliersMax = outliersMaxArr.length === 0 ? null :  d3.max(outliersMaxArr.map((g) => g[y]));

        return { outliersMaxArr, outliersMax ,max, q3, median, q1, min, outliersMin, outliersMinArr };
    })
    .entries(data)
    return transformedData;
};

router.get('/:variable', async (req, res)=>{

    const variable = req.params.variable;
    const url = process.env.DB_CONNECTION;
    const dbName = process.env.DB_NAME;
    const collectionName = process.env.DB_COLLECTION;

    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, async (error, client)=>{
        if(error){
            res(error);
        }else{
            const projectionSettings = { _id:0, price:1, sex:1,}; //set-up field required for front 
            projectionSettings[variable] = 1;

            const collection = client.db(dbName).collection(collectionName);
            const cursor = collection.find({}).project(projectionSettings);
            const result = await cursor.toArray();
            client.close();
            
            const finalData = calcBoxPlotData(result, variable,'price');
       
            res.json(finalData)
        }
    });

});
module.exports = router;