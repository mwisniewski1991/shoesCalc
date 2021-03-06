import '../styles/main.scss'; //IMPORT SASS
import 'babel-polyfill'; //IMPORT BABEL FOR ASYNC/AWAIT
import * as stateCtrl from './state';
import DataFinder from './data/dataFinder';
import * as ui from './UI/UI';
import { htmlElements } from './UI/base';


const { state } = stateCtrl;
const appController = async () =>{
    //START LOADERS
    ui.breakdownLoaders();
    ui.minmaxLoaders();
    ui.priceLevelLoaders();

    state.dataFinder = new DataFinder();
    const { dataFinder } = state;
    
    //BREAKDOWN
    const sexBreakdownData = await dataFinder.getCounterData('sexBreakdown','category','wszystkie');
    ui.createSexDivideChart(sexBreakdownData); 
    ui.breakdownLoaders();
    ui.createScrollableList('sexBreakdown', state.shoesList.category)

    //MINMAX SECTION
    const minmaxData = await dataFinder.getminmaxData('category','wszystkie');
    ui.createMinmaxSection(minmaxData);
    ui.minmaxLoaders()
    ui.createScrollableList('minmax', state.shoesList.category)


    //PRICE LEVEL
    const priceLevelData = await dataFinder.getPriceLevelData('sex');
    ui.createPriceLevelChart(priceLevelData);
    ui.priceLevelLoaders();
};


//FUNCTIONS FOR EVENT LISTENERS
//SEX BREAKDOWN
const changeSexBreakdownSelection = async (e) =>{
    if (e.target.matches('.pieCtrl__button')){
        const target = e.target;
        const changeIndexInt = parseInt(target.value);
        const currentType = state.sexBreakdown.category.currentSelected === true ? 'category' : 'subcategory';
        const { currentIndex, maxIndex } = state.sexBreakdown[currentType];
        const newIndex = currentIndex + changeIndexInt; 

        if(newIndex > 0 && newIndex <= maxIndex){
            ui.breakdownLoaders();

            const { sexBreakdown:{chart, settings}, dataFinder } = state;
            const list = state.shoesList[currentType];
            const filter = list[newIndex-1]; //check what category has to been download from database
            const piechartData = await dataFinder.getCounterData('sexBreakdown',currentType, filter);

            stateCtrl.changeSexbreakdownSettings(currentType, 'currentIndex', newIndex);
            ui.changeCatNumber('sexBreakdown',currentType, newIndex);
            ui.changeMainSpan('sexBreakdown', newIndex, list);

            chart.updateChart(piechartData, settings);
            ui.breakdownLoaders();

            // chart.updateChart(randomSexBreakdownTestData(), settings); //TEST
        }
    };
    if (e.target.matches('.scrollableList__button')){
        const { sexBreakdown, shoesList } = state;
        const selectedName = e.target.dataset.variable;
        const currentType = state.sexBreakdown.category.currentSelected === true ? 'category' : 'subcategory';
        const list = shoesList[currentType];
        const newIndex = list.indexOf(selectedName) + 1;
        const { currentIndex } = sexBreakdown[currentType];

        if(newIndex !== currentIndex){
            ui.breakdownLoaders();

            const { sexBreakdown:{ chart, settings }, dataFinder } = state;
            const piechartData = await dataFinder.getCounterData('sexBreakdown',currentType, selectedName);

            stateCtrl.changeSexbreakdownSettings(currentType, 'currentIndex', newIndex);
            ui.changeCatNumber('sexBreakdown',currentType, newIndex);
            ui.changeMainSpan('sexBreakdown', newIndex, list);
            chart.updateChart(piechartData, settings);
            ui.breakdownLoaders();
            
            // chart.updateChart(randomSexBreakdownTestData(), settings); //TEST
        }
    };
};
const changeSexBreakdownType = async (e) =>{
    if (e.target.matches('.radio__input')){
        const selectedType = e.target.dataset.type
        const currentType = state.sexBreakdown.category.currentSelected === true ? 'category' : 'subcategory';

        if( selectedType !== currentType ){
            ui.breakdownLoaders();

            const { sexBreakdown: { chart, settings }, dataFinder, shoesList } = state;
            const { currentIndex } = state.sexBreakdown[selectedType];
            const list = shoesList[selectedType];
            const filter = list[currentIndex-1];
            const piechartData = await dataFinder.getCounterData('sexBreakdown',selectedType, filter);

            stateCtrl.changeSexbreakdownSettings('category', 'currentSelected', false); //reset value in state
            stateCtrl.changeSexbreakdownSettings('subcategory', 'currentSelected', false); //reset value in state
            stateCtrl.changeSexbreakdownSettings(selectedType, 'currentSelected', true); //set new value
    
            ui.createScrollableList('sexBreakdown', shoesList[selectedType])
            ui.changeMainSpan('sexBreakdown', currentIndex, list);

            chart.updateChart(piechartData, settings)
            // chart.updateChart(randomSexBreakdownTestData(), settings) //TEST
            ui.breakdownLoaders();
        }
    }
};
const showSexbreakdownList = () =>{
    const listButton = htmlElements.sexBreakdown.listButton;
    const list = htmlElements.sexBreakdown.list;

    listButton.classList.toggle('hamburger--active');
    list.classList.toggle('scrollableList--hidden');
};

const pieController = htmlElements.sexBreakdown.controller;
const sexbreakdownListButton = htmlElements.sexBreakdown.listButton;
pieController.addEventListener('click', changeSexBreakdownSelection);
pieController.addEventListener('click', changeSexBreakdownType);
sexbreakdownListButton.addEventListener('click', showSexbreakdownList);

//MINMAX
const changeMinmaxSelection = async (e)=>{
    if (e.target.matches('.minmaxCtrl__button')){
        const { minmax, shoesList } = state;
        const currentType = minmax.category.currentSelected === true ? 'category' : 'subcategory';
        const { currentIndex, maxIndex } = state.minmax[currentType];
        const changeIndexInt = parseInt(e.target.value);
        const newIndex = currentIndex + changeIndexInt; 

        if(newIndex > 0 && newIndex <= maxIndex){
            ui.minmaxLoaders()
            const { dataFinder } = state;
            const list = shoesList[currentType];
            const filter = list[newIndex-1];
            const minmaxData = await dataFinder.getminmaxData(currentType,filter);

            stateCtrl.changeMinmaxSettings(currentType, 'currentIndex', newIndex);
            ui.changeCatNumber('minmax', currentType, newIndex)
            ui.changeMainSpan('minmax', newIndex, list)
            ui.createMinmaxSection(minmaxData);
            ui.minmaxLoaders()
        }
    }
    if (e.target.matches('.scrollableList__button')){
        const { minmax, shoesList } = state;
        const selectedVariable = e.target.dataset.variable;
        const currentType = minmax.category.currentSelected === true ? 'category' : 'subcategory';
        const list = shoesList[currentType];
        const newIndex = list.indexOf(selectedVariable) + 1;
        const { currentIndex } = minmax[currentType];

        if(newIndex !== currentIndex){
            ui.minmaxLoaders()

            const { dataFinder } = state;
            const list = state.shoesList[currentType];
            const filter = list[newIndex-1];
            const minmaxData = await dataFinder.getminmaxData(currentType,filter);

            stateCtrl.changeMinmaxSettings(currentType, 'currentIndex', newIndex);
            ui.changeCatNumber('minmax', currentType, newIndex)
            ui.changeMainSpan('minmax', newIndex, list)
            ui.createMinmaxSection(minmaxData);

            ui.minmaxLoaders()
        }
    }
};
const changeMinmaxType = async (e)=>{
    if (e.target.matches('.radio__input')){
        ui.minmaxLoaders()

        const { dataFinder } = state;
        const selectedType = e.target.dataset.type
        const { currentIndex } = state.minmax[selectedType];
        const list = state.shoesList[selectedType];
        const filter = list[currentIndex-1];
        const minmaxData = await dataFinder.getminmaxData(selectedType,filter);

        stateCtrl.changeMinmaxSettings('category', 'currentSelected', false); //reset value in state
        stateCtrl.changeMinmaxSettings('subcategory', 'currentSelected', false); //reset value in state
        stateCtrl.changeMinmaxSettings(selectedType, 'currentSelected', true); //set new value
        ui.changeMainSpan('minmax', currentIndex, list)
        ui.createScrollableList('minmax', state.shoesList[selectedType])
        ui.createMinmaxSection(minmaxData);
        ui.minmaxLoaders()
    }
};
const showMinmaxList = () =>{
    const listButton = htmlElements.minmax.listButton;
    const list = htmlElements.minmax.list;

    listButton.classList.toggle('hamburger--active');
    list.classList.toggle('scrollableList--hidden');
}

const minmaxController = htmlElements.minmax.controller;
const minmaxListButton = htmlElements.minmax.listButton;
minmaxController.addEventListener('click', changeMinmaxSelection);
minmaxController.addEventListener('click', changeMinmaxType);
minmaxListButton.addEventListener('click', showMinmaxList);


//PRICE LEVEL
const changePriceLevelVariables = async (e)=>{

    if (e.target.matches('.radio__input')){
        let selectedVariable = e.target.dataset.type;
        const { priceLevel: {settings: { variable }} } = state;

        //check if previous and nexy selection is category: if no then update new data, if not change current data in chart class
        const selectedSubcategories = selectedVariable.slice(0,11) === variable.slice(0,11) ? true : false; 
        //check from data in html which parat if subcategory user choose 
        const newSubcategoryPart = selectedVariable.slice(11);

        if(variable !== selectedVariable){
            if(!selectedSubcategories){
                const { priceLevel: { chart, settings }, dataFinder } = state;
                
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
const resizePieChart = ()=>{
    stateCtrl.changeSexbreakdownSettings('settings', 'smallScreen', window.screen.width <= 720 ? true : false);

    const container = htmlElements.sexBreakdown.chartContainer;
    const { chart, settings } = state.sexBreakdown;

    chart.resizeChart(container.offsetWidth, container.offsetHeight, settings);
};

const resizeBoxplot= ()=>{
    stateCtrl.changeBoxplotSettings('smallScreen', window.screen.width <= 720 ? true : false);

    const { chartContainer, variablesController } = htmlElements.priceLevel;
    const { chart, settings  } = stateCtrl.state.priceLevel;
    const { subcategoryPart, smallScreen } = state.priceLevel.settings;

    //if user change screen from small to big subcategory 3 and 4 disapear and app has to change to 2
    if(subcategoryPart==='Three' && smallScreen===false || subcategoryPart==='Four' && smallScreen===false
     ){
        variablesController.querySelector('#priceLevel__input--subcategoryTwo').checked = true;
        stateCtrl.changeBoxplotSettings('subcategoryPart','Two');
        stateCtrl.changeBoxplotSettings('variable','subcategoryTwo');
    };

    chart.resizeChart(chartContainer.offsetWidth, chartContainer.offsetHeight, settings);
};

window.addEventListener('resize', ui.debounce(()=>{
    resizePieChart();
    resizeBoxplot();
},250));

appController();