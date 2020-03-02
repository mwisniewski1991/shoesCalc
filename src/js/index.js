import '../styles/main.scss'; //IMPORT SASS
import "babel-polyfill"; //IMPORT BABEL FOR ASYNC/AWAIT
import MWpieChart from './chartMW/MWpieChart';
import DataFinder from './data/dataFinder';
import * as ui from './UI/UI';
import { htmlElements } from './UI/base';
import { testData } from './data/testData';


const state = {
    dataSet: testData,
    sexBreakdown: {
        data: {},
        chart: {},
        currentSelection: {
            category: true,
            subcategory: false,
        },
        category:{
            currentSelection: true,
            currentIndex: 1,
            maxIndex: 5,
            list: ['wszystkie','klapki-i-sandaly', 'polbuty', 'kozaki-i-inne', 'sportowe'],
        }, 
        subcategory:{
            currentSelection: false,
            currentIndex: 1,
            maxIndex: 42,
            list: [
            "wszystkie",
            "japonki",
            "klapki",
            "sandaly",
            "kapcie",
            "codzienne",
            "wizytowe",
            "glany",
            "trampki",
            "buty-trekkingowe-i-trapery",
            "sneakersy",
            "mokasyny",
            "espadryle",
            "kalosze",
            "trekkingi-i-trapery",
            "kozaki",
            "trzewiki",
            "sztyblety",
            "sniegowce",
            "bieganie",
            "buty-do-wody",
            "fitness",
            "halowki",
            "pilka-nozna",
            "koszykowka",
            "tenis",
            "koturny",
            "na-obcasie",
            "na-koturnie",
            "baleriny",
            "szpilki",
            "lordsy",
            "eleganckie",
            "plaskie",
            "oxfordy",
            "botki",
            "emu",
            "ugg",
            "oficerki",
            "muszkieterki",
            "kowbojki",
            "trampki-i-tenisowki"
        ]},
    },
    discountsBreakdown: {
        chart: {},
        currentSelection: {
            category: true,
            subcategory: false,
        },
        category:{
            currentSelection: true,
            currentIndex: 1,
            maxIndex: 5,
            list: ['wszystkie','klapki-i-sandaly', 'polbuty', 'kozaki-i-inne', 'sportowe'],
        }, 
        subcategory:{
            currentSelection: false,
            currentIndex: 1,
            maxIndex: 42,
            list: [
            "wszystkie",
            "japonki",
            "klapki",
            "sandaly",
            "kapcie",
            "codzienne",
            "wizytowe",
            "glany",
            "trampki",
            "buty-trekkingowe-i-trapery",
            "sneakersy",
            "mokasyny",
            "espadryle",
            "kalosze",
            "trekkingi-i-trapery",
            "kozaki",
            "trzewiki",
            "sztyblety",
            "sniegowce",
            "bieganie",
            "buty-do-wody",
            "fitness",
            "halowki",
            "pilka-nozna",
            "koszykowka",
            "tenis",
            "koturny",
            "na-obcasie",
            "na-koturnie",
            "baleriny",
            "szpilki",
            "lordsy",
            "eleganckie",
            "plaskie",
            "oxfordy",
            "botki",
            "emu",
            "ugg",
            "oficerki",
            "muszkieterki",
            "kowbojki",
            "trampki-i-tenisowki"
        ]},
    },
    priceCatBoxChart: {},
};


const appController = async () =>{

    state.dataFinder = new DataFinder();
    const { dataFinder } = state;
    
    
    //CREATE 1 CHART
    const { dataSet } = state;
    const sexBreakdownData = calcCategoryCounter(dataSet, 'sex');
    // const sexBreakdownData = await dataFinder.getCounterData('sexBreakdown','category','wszystkie');
    createSexDivideChart(sexBreakdownData); //rendering chart

    // CREATE 2 CHART
    const discountsData = calcCategoryCounter(dataSet, 'priceCat');
    // const discountsData = await dataFinder.getCounterData('discountsBreakdown','category','wszystkie');
    createDiscountsChart(discountsData)

    //CREATE 2 CHART
    // state.discounts.data = await dataFinder.getCounterData('priceCat')
    // createDiscountsChart(state.discounts.data)

    //CREATE 3 CHART
    // state.priceCatBoxChart.data = await dataFinder.getBoxPlotData()
    // createPriceCatChart(state.priceCatBoxChart.data);

    // console.log(state);
};

const createSexDivideChart = (data) => {
    //SEX DIVIDE CHART
    const div = htmlElements.sexBreakdown.chartContainer;
    state.sexBreakdown.chart = new MWpieChart('sexDivide', 'pieChart', div);
    const { sexBreakdown : { chart } } = state;
    chart.renderChart(data);
};


const createDiscountsChart = (data) => {
    const div = htmlElements.discountsBreakdown.chartContainer;
    state.discountsBreakdown.chart = new MWpieChart('discountsBreakdown', 'pieChart', div);
    const { discountsBreakdown : { chart } } = state;
    chart.renderChart(data);
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



const changeBreakdownSelection = async (e)=>{
    //BASED OND USER CLICK FUNCTION CHANGE USER INTERFACE AND UPDATES CHARTS

    const target = e.target;
    const className = target.classList[0];

    if(className === "breakdownCtrl__button"){
        const changeIndex = parseInt(target.value);
        const chartType = target.dataset.charttype
        const selectionType = state[chartType].category.currentSelection === true ? 'category' : 'subcategory';

        const { currentIndex, maxIndex, list } = state[chartType][selectionType];
        const newIndex = currentIndex + changeIndex; 

        if(newIndex > 0 && newIndex <= maxIndex){
            state[chartType][selectionType].currentIndex = newIndex //UPDATE STATE WITH NEW INDEX THEN CHANGE UI AND CHARTS
          
            const filter = list[newIndex-1];
            const { chart } = state[chartType];
            const { dataFinder } = state;
            const sexBreakdownData = await dataFinder.getCounterData(chartType,selectionType,filter);
              
            ui.changeBreakdownCatNumber(chartType, selectionType, newIndex)
            ui.changeBreakdownMainSpan(chartType, newIndex, list)
            chart.updateChart(sexBreakdownData)
        }
    }
};
 
const changeBreakdownType = async (e)=>{
    const target = e.target;
    const className = target.classList[0];
    
    if(className === 'radio__input'){
        const chartType = target.dataset.charttype
        const selectionType = target.dataset.selectiontype

        state[chartType].category.currentSelection = false; //reset 
        state[chartType].subcategory.currentSelection = false; //reset
        state[chartType][selectionType].currentSelection = true;

        const { currentIndex, list } = state[chartType][selectionType];
        ui.changeBreakdownMainSpan(chartType, currentIndex, list)

        const filter = list[currentIndex-1];
        const { chart } = state[chartType];
        const { dataFinder } = state;
        const sexBreakdownData = await dataFinder.getCounterData(chartType,selectionType,filter);
        chart.updateChart(sexBreakdownData)
    }
};

const controllers = htmlElements.breakdowns.controllers;
controllers.forEach((contr) => contr.addEventListener('click', changeBreakdownSelection))
controllers.forEach((contr) => contr.addEventListener('click', changeBreakdownType))



// "sex": "F",
// "category": "klapki-i-sandaly",
// "subcategory": "sandaly",
// "priceCat": "Regular"

const filterData = () =>{

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