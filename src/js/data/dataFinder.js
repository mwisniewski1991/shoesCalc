
export default class DataFinder {

    constructor(){
    };

    async getCounterData(chartType, selectionType, filterValue='total'){

        const apiURL = `/counter/${chartType}/${selectionType}/${filterValue}`;
        const response = await fetch(apiURL);
        const serverData = await response.json();
        return serverData;
    }

    async getminmaxData(selectionType, filterValue){

        const apiURL = `/minmax/${selectionType}/${filterValue}`;
        const response = await fetch(apiURL);
        const serverData= await response.json();
        return serverData
    };

    async getPriceLevelData(variable){

        const apiURL = `/priceLevel/${variable}`;
        const response = await fetch(apiURL);
        const serverData = await response.json();
        return serverData;
    }

}