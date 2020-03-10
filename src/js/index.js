import '../styles/main.scss'; //IMPORT SASS
import "babel-polyfill"; //IMPORT BABEL FOR ASYNC/AWAIT
import MWpieChart from './chartMW/MWpieChart';
import DataFinder from './data/dataFinder';
import * as ui from './UI/UI';
import { htmlElements } from './UI/base';
// import { testData } from './data/testDataMinmax.js/testData';
import { minmaxTestData } from './data/minmaxTestData';


const state = {
    // dataSet: testData,
    shoesList: {
        category: ['wszystkie','klapki-i-sandaly', 'polbuty', 'kozaki-i-inne', 'sportowe'],
        subcategory: [
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
            "trampki-i-tenisowki"] 
    },
    sexBreakdown: {
        data: {},
        chart: {},
        category:{
            currentSelection: true,
            currentIndex: 1,
            maxIndex: 5,
        }, 
        subcategory:{
            currentSelection: false,
            currentIndex: 1,
            maxIndex: 42,
        },
    },
    discountsBreakdown: {
        chart: {},
        category:{
            currentSelection: true,
            currentIndex: 1,
            maxIndex: 5,
        }, 
        subcategory:{
            currentSelection: false,
            currentIndex: 1,
            maxIndex: 42,
        },
    },
    minmax:{
        category:{
            currentSelection: true,
            currentIndex: 1,
            maxIndex: 5,
        }, 
        subcategory:{
            currentSelection: false,
            currentIndex: 1,
            maxIndex: 42,
        },
    },
    priceCatBoxChart: {},
};


const appController = async () =>{

    state.dataFinder = new DataFinder();
    const { dataFinder } = state;
    // const { dataSet } = state;
    
    //CREATE 1 CHART
    // const sexBreakdownData = calcCategoryCounter(dataSet, 'sex'); //TEST DATA
    const sexBreakdownData = await dataFinder.getCounterData('sexBreakdown','category','wszystkie');
    createSexDivideChart(sexBreakdownData); //rendering chart

    // CREATE 2 CHART
    // const discountsData = calcCategoryCounter(dataSet, 'priceCat'); //TEST DATA
    const discountsData = await dataFinder.getCounterData('discountsBreakdown','category','wszystkie');
    createDiscountsChart(discountsData)

    //CREATE MINMAX SECTION
    // const minmaxData = await dataFinder.getminmaxData('category','wszystkie');
    createMinmaxSection(minmaxTestData);
    

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

const createMinmaxSection = (data)=>{
    // console.log(data);    
    const keys = Object.keys(data);

    for(let key of keys){
        ui.createMinmaxElement(key, data[key][0])
    }

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

const changeSelection = async (e)=>{
    //BASED OND USER CLICK FUNCTION CHANGE USER INTERFACE AND UPDATES CHARTS

    const target = e.target;
    const className = target.classList[0];
    
    if(className === "breakdownCtrl__button" || className==='minmaxCtrl__button'){
        const changeIndex = parseInt(target.value);
        const sectionType = target.dataset.sectiontype
        const selectionType = state[sectionType].category.currentSelection === true ? 'category' : 'subcategory';

        const { currentIndex, maxIndex } = state[sectionType][selectionType];
        const list = state.shoesList[selectionType];
        const newIndex = currentIndex + changeIndex; 

        if(newIndex > 0 && newIndex <= maxIndex){
            state[sectionType][selectionType].currentIndex = newIndex //UPDATE STATE WITH NEW INDEX THEN CHANGE UI AND CHARTS
      
            ui.changeCatNumber(sectionType, selectionType, newIndex)
            ui.changeMainSpan(sectionType, newIndex, list)

            if(sectionType === 'minmax'){
                const { dataFinder } = state;
                const filter = list[newIndex-1];
                const minmaxData = await dataFinder.getminmaxData(selectionType,filter);
                createMinmaxSection(minmaxData);

            }else{
                const filter = list[newIndex-1];
                const { chart } = state[sectionType];
                const { dataFinder } = state;
                const sexBreakdownData = await dataFinder.getCounterData(sectionType,selectionType,filter);
                chart.updateChart(sexBreakdownData)
            }
        }
    }
};
 
const changeType = async (e)=>{
    const target = e.target;
    const className = target.classList[0];
    
    if(className === 'radio__input'){
        const sectionType = target.dataset.sectiontype
        const selectionType = target.dataset.selectiontype

        state[sectionType].category.currentSelection = false; //reset 
        state[sectionType].subcategory.currentSelection = false; //reset
        state[sectionType][selectionType].currentSelection = true;

        const { currentIndex } = state[sectionType][selectionType];
        const list = state.shoesList[selectionType];
        ui.changeMainSpan(sectionType, currentIndex, list)

        if(sectionType === 'minmax'){
            const { dataFinder } = state;
            const filter = list[currentIndex-1];
            const minmaxData = await dataFinder.getminmaxData(selectionType,filter);
            createMinmaxSection(minmaxData);

        }else{
            const filter = list[currentIndex-1];
            const { chart } = state[sectionType];
            const { dataFinder } = state;
            const sexBreakdownData = await dataFinder.getCounterData(sectionType,selectionType,filter);
            chart.updateChart(sexBreakdownData)
        }
    }
};


const controllersOne = htmlElements.controllersOne;
controllersOne.forEach((contr) => contr.addEventListener('click', changeSelection))
controllersOne.forEach((contr) => contr.addEventListener('click', changeType))




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