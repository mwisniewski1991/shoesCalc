import { htmlElements, uiLabels } from './base';

export const changeCatNumber = (chartType, type, newIndex)=>{

    const controller = htmlElements[chartType].controller
    const spanId = type === 'category' ? '.catNumber' : '.subcatNumber';
    const spanElement = controller.querySelector(spanId);
    spanElement.innerText = newIndex

};  
export const changeMainSpan = (chartType, newIndex, list)=>{
    const controller = htmlElements[chartType].controller;
    const mainSpanElement = controller.querySelector('.mainSpan');
    const newLabels = uiLabels[list[newIndex-1]]; //search ui label based on arrat from state
    mainSpanElement.innerText = newLabels;
};

export const createMinmaxElement = (element, {nameFirst, category, subcategory, price, imageLink})=>{
    
    const htmlParent = htmlElements.minmax.elements[element];
    htmlParent.querySelector('.shoesContainer__firstName').innerText = nameFirst;
    htmlParent.querySelector('.shoesContainer__category').innerText = uiLabels[category];
    htmlParent.querySelector('.shoesContainer__subcategory').innerText = uiLabels[subcategory];
    htmlParent.querySelector('.shoesContainer__price').innerText = price;
    htmlParent.querySelector('.shoesContainer__image').src = `https://${imageLink}`

};
