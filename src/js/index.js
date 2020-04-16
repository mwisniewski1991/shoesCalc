import '../styles/main.scss'; //IMPORT SASS
import "babel-polyfill"; //IMPORT BABEL FOR ASYNC/AWAIT
import * as stateCtrl from './state';
import DataFinder from './data/dataFinder';
import PieChart from './charts/pieChart';
import Boxplot from './charts/boxplot';
import * as ui from './UI/UI';
import { htmlElements } from './UI/base';

//TEST
import { sexBreakdownTestData, sexBreakdownTestDataTwo } from './data/sexBreakdownTestData';
import { minmaxTestData } from './data/minmaxTestData';
import { boxPlotSex, boxPlotCat, boxPlotSubcat} from './data/priceLevelTestData';


const { state } = stateCtrl;

const appController = async () =>{

    //START LOADERS
    ui.breakdownLoaders('sexBreakdown');
    ui.minmaxLoaders();
    ui.priceLevelLoaders();

    state.dataFinder = new DataFinder();

    const { dataFinder } = state;
    // const { dataSet } = state;
    
    //BREAKDOWN
    createSexDivideChart(sexBreakdownTestData); //TEST
    // const sexBreakdownData = await dataFinder.getCounterData('sexBreakdown','category','wszystkie');
    // createSexDivideChart(sexBreakdownData); 
    ui.breakdownLoaders('sexBreakdown');


    //MINMAX SECTION
    createMinmaxSection(minmaxTestData); //TEST
    // const minmaxData = await dataFinder.getminmaxData('category','wszystkie');
    // createMinmaxSection(minmaxData);
    // ui.minmaxLoaders()

    //PRICE LEVEL
    createPriceLevelChart(boxPlotSex); //TEST
    // const priceLevelData = await dataFinder.getPriceLevelData('sex');
    // createPriceLevelChart(priceLevelData);
    ui.priceLevelLoaders();
    
};

const createSexDivideChart = (data) => {
    //SEX DIVIDE CHART
    const div = htmlElements.sexBreakdown.chartContainer;

    stateCtrl.changeSexbreakdownSettings('settings', 'smallScreen', window.screen.width <= 480 ? true : false);
    state.sexBreakdown.chart = new PieChart('sexDivide', 'pieChart', div);

    const { sexBreakdown : { chart, settings } } = state;

    chart.renderChart(data, settings);
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

    stateCtrl.changeBoxplotSettings('smallScreen', window.screen.width <= 480 ? true : false); //check on load if screen is big or small
    state.priceLevel.chart = new Boxplot('priceLevel','boxplot', div);

    const { chart, settings } = state.priceLevel;
    chart.renderChart(data, settings);
};


//FUNCTIONS FOR EVENT LISTENERS
//SEX BREAKDOWN
const changeSexBreakdownSelection = async (e) =>{
    if (e.target.matches('.pieCtrl__button')){
        const target = e.target;
        const changeIndex = parseInt(target.value);
        const selectionType = state.sexBreakdown.category.currentSelected === true ? 'category' : 'subcategory';
        const { currentIndex, maxIndex } = state.sexBreakdown[selectionType];
        const newIndex = currentIndex + changeIndex; 

        if(newIndex > 0 && newIndex <= maxIndex){
            const { sexBreakdown:{chart, settings}, dataFinder } = state;
            const list = state.shoesList[selectionType];
            const filter = list[newIndex-1]; //check what category has to been download from database

            stateCtrl.changeSexbreakdownSettings(selectionType, 'currentIndex', newIndex);
            ui.changeCatNumber('sexBreakdown',selectionType, newIndex);
            ui.changeMainSpan('sexBreakdown', newIndex, list);
        

            chart.updateChart(sexBreakdownTestDataTwo, settings); //TEST
            // ui.breakdownLoaders('sexBreakdown');
            // const piechartData = await dataFinder.getCounterData('sexBreakdown',selectionType, filter);
            // chart.updateChart(piechartData, settings);
            // ui.breakdownLoaders('sexBreakdown');
        }
    }
};

const changeSexBreakdownType = async (e) =>{
    
    if (e.target.matches('.radio__input')){

        const { sexBreakdown: { chart, settings }, dataFinder } = state;
        const selectionType = e.target.dataset.selectiontype
        const { currentIndex } = state.sexBreakdown[selectionType];
        const list = state.shoesList[selectionType];
        const filter = list[currentIndex-1];

        stateCtrl.changeSexbreakdownSettings('category', 'currentSelected', false); //reset value in state
        stateCtrl.changeSexbreakdownSettings('subcategory', 'currentSelected', false); //reset value in state
        stateCtrl.changeSexbreakdownSettings(selectionType, 'currentSelected', true); //set new value
        ui.changeMainSpan('sexBreakdown', currentIndex, list)

        ui.breakdownLoaders('sexBreakdown');
        const piechartData = await dataFinder.getCounterData('sexBreakdown',selectionType, filter);
        chart.updateChart(piechartData, settings)
        ui.breakdownLoaders('sexBreakdown');
    }
};

const pieController = htmlElements.sexBreakdown.controller;
pieController.addEventListener('click', changeSexBreakdownSelection);
pieController.addEventListener('click', changeSexBreakdownType);


//MINMAX
const changeMinmaxSelection = async (e)=>{
    
    if (e.target.matches('.minmaxCtrl__button')){

        const changeIndex = parseInt(e.target.value);
        const selectionType = state.minmax.category.currentSelected === true ? 'category' : 'subcategory';
        const { currentIndex, maxIndex } = state.minmax[selectionType];
        const newIndex = currentIndex + changeIndex; 

        if(newIndex > 0 && newIndex <= maxIndex){
            const { dataFinder } = state;
            const list = state.shoesList[selectionType];
            const filter = list[newIndex-1];

            stateCtrl.changeMinmaxSettings(selectionType, 'currentIndex', newIndex);
            ui.changeCatNumber('minmax', selectionType, newIndex)
            ui.changeMainSpan('minmax', newIndex, list)

            ui.minmaxLoaders()
            const minmaxData = await dataFinder.getminmaxData(selectionType,filter);
            createMinmaxSection(minmaxData);
            ui.minmaxLoaders()
        }
    }
};
const changeMinmaxType = async (e)=>{

    if (e.target.matches('.radio__input')){
        const { dataFinder } = state;
        const selectionType = e.target.dataset.selectiontype
        const { currentIndex } = state.minmax[selectionType];
        const list = state.shoesList[selectionType];
        const filter = list[currentIndex-1];

        stateCtrl.changeMinmaxSettings('category', 'currentSelected', false); //reset value in state
        stateCtrl.changeMinmaxSettings('subcategory', 'currentSelected', false); //reset value in state
        stateCtrl.changeMinmaxSettings(selectionType, 'currentSelected', true); //set new value
        ui.changeMainSpan('minmax', currentIndex, list)
        
        ui.minmaxLoaders()
        const minmaxData = await dataFinder.getminmaxData(selectionType,filter);
        createMinmaxSection(minmaxData);
        ui.minmaxLoaders()
    }
};

const minmaxController = htmlElements.minmax.controller;
minmaxController.addEventListener('click', changeMinmaxSelection);
minmaxController.addEventListener('click', changeMinmaxType);


//PRICE LEVEL
const changePriceLevelVariables = async (e)=>{

    if (e.target.matches('.radio__input')){
        let selectedVariable = e.target.dataset.variable;
        const { priceLevel: {settings: { variable }} } = state;

        //check if previous and nexy selection is category: if no then update new data, if not change current data in chart class
        const selectedSubcategories = selectedVariable.slice(0,11) === variable.slice(0,11) ? true : false; 
        //check from data in html which parat if subcategory user choose 
        const newSubcategoryPart = selectedVariable.slice(11);

        if(variable !== selectedVariable){
            if(!selectedSubcategories){
                const { priceLevel: { chart, settings }, dataFinder } = state;

                //TEST DATA
                let data = [];
                switch(selectedVariable){
                    case 'sex':
                        data = boxPlotSex;
                        break;
                    case 'category':
                        data = boxPlotCat;
                        break;
                    case 'subcategoryOne':
                        data = boxPlotSubcat;
                        break;
                    case 'subcategoryTwo':
                        data = boxPlotSubcat;
                        break;
                    case 'subcategoryThree':
                        data = boxPlotSubcat;
                        break;
                    case 'subcategoryFour':
                        data = boxPlotSubcat;
                        break;
                };
                
                //check if current selection if subcategory
                let selectedSubcategory = selectedVariable.slice(0,11) === "subcategory" ? true : false; 
                stateCtrl.changeBoxplotSettings('selectedSubcategory', selectedSubcategory);
                stateCtrl.changeBoxplotSettings('subcategoryPart', newSubcategoryPart);
                stateCtrl.changeBoxplotSettings('variable', selectedVariable);
    
                if(selectedSubcategory){selectedVariable = selectedVariable.slice(0,11)};
    
                ui.priceLevelLoaders();
                const priceLevelData = await dataFinder.getPriceLevelData(selectedVariable);
                chart.renderChart(priceLevelData, settings);
                ui.priceLevelLoaders();

            }else{
                const { chart, settings } = state.priceLevel;
                stateCtrl.changeBoxplotSettings('subcategoryPart', newSubcategoryPart);
                stateCtrl.changeBoxplotSettings('variable', selectedVariable);

                chart.sortChart(settings);
            }
        }
    };

};
const changePriceLevelSort = async (e) =>{

    if (e.target.matches('.radio__input')){
        const selectedSortType = e.target.dataset.sorttype;
        const { priceLevel: { settings: { sortType } } } = state;

        if(sortType !== selectedSortType){ //not sort if user clicked active button
            const { chart, settings } = state.priceLevel;
            stateCtrl.changeBoxplotSettings('sortType', selectedSortType);
            chart.sortChart(settings);
        }
    }
};

const variablesController = htmlElements.priceLevel.variablesController;
variablesController.addEventListener('click', changePriceLevelVariables);
const sortController = htmlElements.priceLevel.sortController;
sortController.addEventListener('click', changePriceLevelSort);

//RESIZE CHARTS
const resizePriceLevel = ()=>{
    stateCtrl.changeBoxplotSettings('smallScreen', window.screen.width <= 720 ? true : false);

    const container = htmlElements.priceLevel.chartContainer;
    const { chart, settings } = state.priceLevel;

    chart.resizeChart(container.offsetWidth, container.offsetHeight, settings);
};

const resizePieChart = ()=>{
    stateCtrl.changeSexbreakdownSettings('settings', 'smallScreen', window.screen.width <= 720 ? true : false);

    const container = htmlElements.sexBreakdown.chartContainer;
    const { chart, settings } = state.sexBreakdown;

    chart.resizeChart(container.offsetWidth, container.offsetHeight, settings);
};


window.addEventListener('resize', ui.debounce(()=>{
    resizePriceLevel();
    resizePieChart();
},250));


appController();