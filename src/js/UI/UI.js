import { htmlElements, uiLabels } from './base';

export const changeBreakdownCatNumber = (chartType, type, newIndex)=>{

    const controller = htmlElements[chartType].controller
    const spanId = type === 'category' ? '.catNumber' : '.subcatNumber';
    const spanElement = controller.querySelector(spanId);
    spanElement.innerText = newIndex

};  

export const changeBreakdownMainSpan = (chartType, newIndex, list)=>{
    const controller = htmlElements[chartType].controller;
    const mainSpanElement = controller.querySelector('.breakdownCtrl__mainSpan');
    const newLabels = uiLabels[list[newIndex-1]]; //search ui label based on arrat from state
    mainSpanElement.innerText = newLabels;
};