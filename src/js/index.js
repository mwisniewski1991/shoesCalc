import '../styles/main.scss'; //IMPORT SASS
import "babel-polyfill"; //IMPORT BABEL FOR ASYNC/AWAIT
import MWpieChart from './chartMW/MWpieChart';
import DataFinder from './data/dataFinder';
import { htmlElements } from './UI/base';
import { testData } from './data/testData';


const state = {
    sexDivide: {},
    discounts: {},
    priceCatBoxChart: {},
    dataSet: testData,
};


const appController = async () =>{
  

    state.dataFinder = new DataFinder();
    const { dataFinder } = state;


    const { dataSet } = state;

    //CREATE 1 CHART
    const sexDivideData = calcCategoryCounter(dataSet, 'sex');
    createSexDivideChart(sexDivideData); //rendering chart

    //CREATE 2 CHART
    const discountsData = calcCategoryCounter(dataSet, 'priceCat');
    createDiscountsChart(discountsData)

    //CREATE 2 CHART
    // state.discounts.data = await dataFinder.getCounterData('priceCat')
    // createDiscountsChart(state.discounts.data)

    //CREATE 3 CHART
    // state.priceCatBoxChart.data = await dataFinder.getBoxPlotData()
    // createPriceCatChart(state.priceCatBoxChart.data);

    console.log(state);
};



const createSexDivideChart = (data) => {
    //SEX DIVIDE CHART
    const div = htmlElements.sexDivideChart.chartContainer;

    state.sexDivide = new MWpieChart('sexDivide', div);
    const { sexDivide } = state;

    sexDivide.renderChart(data);
    sexDivide.renderVis(0, 'path', true);
};


const createDiscountsChart = (data) => {
    const div = htmlElements.discountsChart.chartContainer;

    state.discounts = new MWpieChart('sexDivide', div);
    const { discounts } = state;

    discounts.renderChart(data);
    discounts.renderVisTwo(0, 'path', false);

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

appController();



// "sex": "F",
// "category": "klapki-i-sandaly",
// "subcategory": "sandaly",
// "priceCat": "Regular"


