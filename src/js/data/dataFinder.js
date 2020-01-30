
export default class DataFinder {

    constructor(){
    };

    async getCounterData(type){

        const apiURL = `/counter/${type}`;
        const response = await fetch(apiURL);
        const serverData = await response.json();
        return serverData;
    }

    async getBoxPlotData(){

        const apiURL = `/total`;
        const response = await fetch(apiURL);
        const serverData = await response.json();
        return serverData;
    }


}