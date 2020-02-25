import '../styles/main.scss'; //IMPORT SASS
import "babel-polyfill"; //IMPORT BABEL FOR ASYNC/AWAIT
import MWpieChart from './chartMW/MWpieChart';
import DataFinder from './data/dataFinder';
import { htmlElements } from './UI/base';
import { testData } from './data/testData';


const state = {
    dataSet: testData,
    sexBreakdown: {
        chart: {},
        currentSelection: {
            category: true,
            subcategory: false,
        },
        category: ['wszystkie','klapki-i-sandaly', 'polbuty', 'kozaki-i-inne', 'sportowe'],
        subcategory: ['japonki',
            'klapki',
            'sandaly',
            'kapcie',
            'codzienne',
            'wizytowe',
            'glany',
            'trampki',
            'buty-trekkingowe-i-trapery',
            'sneakersy',
            'mokasyny',
            'espadryle',
            'codzienne',
            'wizytowe',
            'kalosze',
            'trekkingi-i-trapery',
            'glany',
            'kozaki',
            'trzewiki',
            'sztyblety',
            'sniegowce',
            'trampki',
            'trekkingi-i-trapery',
            'bieganie',
            'buty-do-wody',
            'fitness',
            'halowki',
            'pilka-nozna',
            'koszykowka',
            'tenis',
            'sandaly',
            'klapki',
            'japonki',
            'koturny',
            'espadryle',
            'kapcie',
            'codzienne',
            'na-obcasie',
            'na-koturnie',
            'baleriny',
            'trekkingi-i-trapery',
            'trampki',
            'szpilki',
            'lordsy',
            'eleganckie',
            'plaskie',
            'sneakersy',
            'mokasyny',
            'oxfordy',
            'glany',
            'espadryle',
            'botki',
            'kozaki',
            'kalosze',
            'trekkingi-i-trapery',
            'emu',
            'ugg',
            'sztyblety',
            'oficerki',
            'muszkieterki',
            'sniegowce',
            'glany',
            'kowbojki',
            'trampki-i-tenisowki',
            'trekkingi-i-trapery',
            'bieganie',
            'fitness',
            'buty-do-wody',
            'koszykowka',
            'tenis'],
    },
    discounts: {},
    priceCatBoxChart: {},
};


const appController = async () =>{
  

    state.dataFinder = new DataFinder();
    const { dataFinder } = state;
    const { dataSet } = state;

    //CREATE 1 CHART
    const sexBreakdownData = calcCategoryCounter(dataSet, 'sex');
    createSexDivideChart(sexBreakdownData); //rendering chart

    //CREATE 2 CHART
    // const discountsData = calcCategoryCounter(dataSet, 'priceCat');
    // createDiscountsChart(discountsData)

    //CREATE 2 CHART
    // state.discounts.data = await dataFinder.getCounterData('priceCat')
    // createDiscountsChart(state.discounts.data)

    //CREATE 3 CHART
    // state.priceCatBoxChart.data = await dataFinder.getBoxPlotData()
    // createPriceCatChart(state.priceCatBoxChart.data);

    console.log(state.sexBreakdown);
};



const createSexDivideChart = (data) => {
    //SEX DIVIDE CHART
    const div = htmlElements.sexDivideChart.chartContainer;

    state.sexBreakdown.chart = new MWpieChart('sexDivide', 'pieChart', div);
    const { sexBreakdown : { chart } } = state;

    chart.renderChart(data);

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


