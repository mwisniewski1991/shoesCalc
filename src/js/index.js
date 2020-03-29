import '../styles/main.scss'; //IMPORT SASS
import "babel-polyfill"; //IMPORT BABEL FOR ASYNC/AWAIT
import * as stateCtrl from './state';
import DataFinder from './data/dataFinder';
import PieChart from './charts/pieChart';
import Boxplot from './charts/boxplot';
import * as ui from './UI/UI';
import { htmlElements } from './UI/base';

// import { testData } from './data/testDataMinmax.js/testData';
import { minmaxTestData } from './data/minmaxTestData';
import { boxPlotSex, boxPlotCat, boxPlotSubcat} from './data/priceLevelTestData';


const { state } = stateCtrl;

const appController = async () =>{

    //START LOADERS
    ui.minmaxLoaders();
    ui.breakdownLoaders('sexBreakdown');
    ui.breakdownLoaders('discountsBreakdown');

    state.dataFinder = new DataFinder();

    

    const { dataFinder } = state;
    // const { dataSet } = state;
    
    //BREAKDOWN
    // const sexBreakdownData = calcCategoryCounter(dataSet, 'sex'); //TEST DATA
    // const sexBreakdownData = await dataFinder.getCounterData('sexBreakdown','category','wszystkie');
    // createSexDivideChart(sexBreakdownData); 
    ui.breakdownLoaders('sexBreakdown');

    // const discountsData = calcCategoryCounter(dataSet, 'priceCat'); //TEST DATA
    // const discountsData = await dataFinder.getCounterData('discountsBreakdown','category','wszystkie');
    // createDiscountsChart(discountsData)
    ui.breakdownLoaders('discountsBreakdown');


    //MINMAX SECTION
    // const minmaxData = await dataFinder.getminmaxData('category','wszystkie');
    createMinmaxSection(minmaxTestData);
    ui.minmaxLoaders()


    //PRICE LEVEL
    // const priceLevelData = await dataFinder.getPriceLevelData('sex');
    createPriceLevelChart(boxPlotSex)

    // console.log(state.priceLevel);
};

const createSexDivideChart = (data) => {
    //SEX DIVIDE CHART
    const div = htmlElements.sexBreakdown.chartContainer;
    state.sexBreakdown.chart = new PieChart('sexDivide', 'pieChart', div);
    const { sexBreakdown : { chart } } = state;
    chart.renderChart(data);
};

const createDiscountsChart = (data) => {
    const div = htmlElements.discountsBreakdown.chartContainer;
    state.discountsBreakdown.chart = new PieChart('discountsBreakdown', 'pieChart', div);
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

const createPriceLevelChart = (data) => {

    const div = htmlElements.priceLevel.chartContainer;
    state.priceLevel.chart = new Boxplot('priceLevel','boxplot', div);
    const { chart, settings } = state.priceLevel;
    chart.renderChart(data, settings);

};


//FUNCTIONS FOR EVENT LISTENERS
//pie / breakdown
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
                ui.minmaxLoaders()
                const { dataFinder } = state;
                const filter = list[newIndex-1];
                const minmaxData = await dataFinder.getminmaxData(selectionType,filter);
                createMinmaxSection(minmaxData);
                ui.minmaxLoaders()

            }else{
                ui.breakdownLoaders(sectionType);
                const filter = list[newIndex-1];
                const { chart } = state[sectionType];
                const { dataFinder } = state;
                const piechartData = await dataFinder.getCounterData(sectionType,selectionType,filter);
                chart.updateChart(piechartData)
                ui.breakdownLoaders(sectionType);
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
            ui.minmaxLoaders()
            const { dataFinder } = state;
            const filter = list[currentIndex-1];
            const minmaxData = await dataFinder.getminmaxData(selectionType,filter);
            createMinmaxSection(minmaxData);
            ui.minmaxLoaders()

        }else{
            ui.breakdownLoaders(sectionType);
            const filter = list[currentIndex-1];
            const { chart } = state[sectionType];
            const { dataFinder } = state;
            const piechartData = await dataFinder.getCounterData(sectionType,selectionType,filter);
            chart.updateChart(piechartData)
            ui.breakdownLoaders(sectionType);
        }
    }
};

//boxplot / pricelevel
const changePriceLevelVariables = async (e)=>{

    if (e.target.matches('.radio__input')){
        const variable = e.target.dataset.variable;
        const { priceLevel: {settings: { currentVariable }} } = state;

        if(currentVariable !== variable){
            stateCtrl.priceLevelselectVariable(variable);


            let data = [];
            switch(variable){
                case 'sex':
                    data = boxPlotSex;
                    break;
                case 'category':
                    data = boxPlotCat;
                    break;
                case 'subcategoryOne':
                    data = boxPlotSubcat.slice(0,10);
                    break;
                case 'subcategoryTwo':
                    data = boxPlotSubcat.slice(10,20);
                    break;
            };
            
            const { priceLevel: { chart, settings }, dataFinder } = state;
            // const priceLevelData = await dataFinder.getPriceLevelData(variable);

            chart.updateChart(data, settings);
        }
    };

};
 
const changePriceLevelSort = async (e) =>{

    if (e.target.matches('.radio__input')){
        const sortType = e.target.dataset.sorttype;
        const { priceLevel: { settings: { currentSort } } } = state;


        if(currentSort !== sortType){

            stateCtrl.priceLevelSelectSort(sortType);

            const { chart, settings } = state.priceLevel;
            chart.sortChart(settings);
        }
    }
};


//EVENT LISTENERS
const controllersOne = htmlElements.controllersOne;
controllersOne.forEach((contr) => contr.addEventListener('click', changeSelection))
controllersOne.forEach((contr) => contr.addEventListener('click', changeType))

const variablesController = htmlElements.priceLevel.variablesController;
variablesController.addEventListener('click', changePriceLevelVariables);

const sortController = htmlElements.priceLevel.sortController;
sortController.addEventListener('click', changePriceLevelSort)

// "sex": "F",
// "category": "klapki-i-sandaly",
// "subcategory": "sandaly",
// "priceCat": "Regular"

const calcCategoryCounter = (data, select) => {
    const categories = Array.from(new Set(data.map((el)=>el[select])));
    const finalObj = {};
    categories.forEach((cat)=>{
        finalObj[cat] = data.filter((el) => {return el[select] === cat}).length;
    });
    return finalObj;
};
appController();