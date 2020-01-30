import '../styles/main.scss'; //IMPORT SASS
import "babel-polyfill"; //IMPORT BABEL FOR ASYNC/AWAIT
import ChartMW from './chartMW/chartMW';
import DataFinder from './data/dataFinder';
import { htmlElements } from './UI/base';
import { testData } from './data/testData';


const state = {
    sexDivide: {},
    discounts: {},
    priceCatBoxChart: {},
};

const appController = async () =>{

    state.dataFinder = new DataFinder();
    const { dataFinder } = state;

    //CREATE 1 CHART
    // state.sexDivide.data = await dataFinder.getCounterData('sex') //data
    createSexDivideChart(state.sexDivide.data); //rendering chart

    //CREATE 2 CHART
    // state.discounts.data = await dataFinder.getCounterData('priceCat')
    createDiscountsChart(state.discounts.data)

    //CREATE 3 CHART
    // state.priceCatBoxChart.data = await dataFinder.getBoxPlotData()
    createPriceCatChart(state.priceCatBoxChart.data);

    console.log(state);
};
// appController();



const createSexDivideChart = (data) => {
    //SEX DIVIDE CHART

    const { sexDivide } = state;
    const div = htmlElements.sexDivideChart.chartContainer;

    sexDivide.chart = new ChartMW('sexDivide', div);
    sexDivide.chart.createSvg('pie');
    sexDivide.chart.loadData(data);
    sexDivide.chart.calcPieData();
    sexDivide.chart.createCoreElement(0, 'path', 'pie');
    sexDivide.chart.drawPie(0, 'path', true);
};

const createDiscountsChart = (data) => {

    //DISCOUNT CHART
    const { discounts } = state;
    const div = htmlElements.discountsChart.chartContainer;

    discounts.chart = new ChartMW('discounts', div);
    discounts.chart.createSvg('pie');
    discounts.chart.loadData(data);
    discounts.chart.calcPieData();
    discounts.chart.createCoreElement(0, 'path', 'pie');
    discounts.chart.drawPie(0, 'path');
};

const createPriceCatChart = (data) => {

    //PRICECATEGORY
    const { priceCatBoxChart } = state;
    const div = htmlElements.priceCatBoxChart.chartContainer;
    state.priceCatBoxChart.chart = new ChartMW('priceCatBoxChart', div);

    const xVal = 'subcategory';
    priceCatBoxChart.chart.createSvg(div);
    priceCatBoxChart.chart.loadData(data);
    priceCatBoxChart.chart.calcBoxPlotData(xVal, 'price');
    priceCatBoxChart.chart.createXaxis(xVal,'bandBox');
    priceCatBoxChart.chart.createYaxis('price','linearZero');
    priceCatBoxChart.chart.drawBoxes(0);
    priceCatBoxChart.chart.createCoreElement(0,'circle');

    // priceCatBoxChart.chart.drawBoxPlotDots(xVal,'price',0 , 'circle')
};




const calcCategoryCounter = (data, select) => {
    const categories = Array.from(new Set(data.map((el)=>el[select])));
    const finalObj = {};
    categories.forEach((cat)=>{
        finalObj[cat] = data.filter((el) => {return el[select] === cat}).length;
    });

    return finalObj;
};

// appCtr();


// "sex": "F",
// "category": "klapki-i-sandaly",
// "subcategory": "sandaly",
// "priceCat": "Regular"
















// const newData = testData.map((el) => {
//     const sex = el.sex;
//     const price = el.price;     
//     const oldPrice = el.oldPrice;
//     return {sex, price, oldPrice}
// })

// console.log(newData);


