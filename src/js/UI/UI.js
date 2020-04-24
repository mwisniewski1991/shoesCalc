import { htmlElements, uiLabels } from './base';
import image from '../../images/shoesImg/lackShoesThree.png';
import { html } from 'd3';

export const debounce = (func, wait, immediate)=>{
	let timeout;
	return function() {
		const context = this, args = arguments;
		const later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

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

export const createMinmaxElement = (DOMelement, shoesObject)=>{

    
    if(shoesObject != undefined){

        const {nameFirst, category, subcategory, price, imageLink} = shoesObject;
        const htmlParent = htmlElements.minmax.elements[DOMelement];

        htmlParent.querySelector('.shoesContainer__firstName').innerText = nameFirst;
        htmlParent.querySelector('.shoesContainer__category').innerText = uiLabels[category];
        htmlParent.querySelector('.shoesContainer__subcategory').innerText = uiLabels[subcategory];
        htmlParent.querySelector('.shoesContainer__price').innerText = price;
        htmlParent.querySelector('.shoesContainer__image').src = `https://${imageLink}`
        
    }else{

        const htmlParent = htmlElements.minmax.elements[DOMelement];
        htmlParent.querySelector('.shoesContainer__firstName').innerText = 'Brak w bazie';
        htmlParent.querySelector('.shoesContainer__category').innerText = '--';
        htmlParent.querySelector('.shoesContainer__subcategory').innerText = '--';
        htmlParent.querySelector('.shoesContainer__price').innerText = '?';
        htmlParent.querySelector('.shoesContainer__image').src = image;
    }
};

export const createSexbreakdownList = (subcategoryList) =>{

    const list = htmlElements.sexBreakdown.list.querySelector("ul");

    subcategoryList.forEach((subcategory) => {
        const itemHTML = `
            <li class="scrollableList__item">
                <button class="scrollableList__button" data-selectionType="${subcategory}">
                    ${uiLabels[subcategory]}
                </button>
            </li>
        `;
        list.insertAdjacentHTML('beforeend', itemHTML);
    });
};

//LOADERS
export const breakdownLoaders = (chartType) => {
    const loader = htmlElements[chartType].loader;
    loader.classList.toggle('pieContainer__loaderContainer--hidden')
    const bigCircles = loader.querySelector('.loader');
    const smallCircles = [...loader.querySelectorAll('.loader__small')];

    //ACTIVTA-DISACTIVATE LOADERS
    bigCircles.classList.toggle('loader--stoped');
    smallCircles.forEach(smallCircle => smallCircle.classList.toggle('loader__small--stoped'))
};

export const minmaxLoaders = () => {
    const loaders = htmlElements.minmax.loaders;

    //ACTIVTA-DISACTIVATE LOADERS
    for(const loader of loaders){
        loader.classList.toggle('shoesContainer__loaderContainer--hidden');

        const bigCircles = loader.querySelector('.loader');
        const smallCircles = [...loader.querySelectorAll('.loader__small')];

        bigCircles.classList.toggle('loader--stoped');
        smallCircles.forEach(smallCircle => smallCircle.classList.toggle('loader__small--stoped'))
    };
};

export const priceLevelLoaders = () => {

    const loader = htmlElements.priceLevel.loader;
    loader.classList.toggle('priceLevelBox__loaderContainer--hidden')
    
    const bigCircles = loader.querySelector('.loader');
    const smallCircles = [...loader.querySelectorAll('.loader__small')];

    //ACTIVTA-DISACTIVATE LOADERS
    bigCircles.classList.toggle('loader--stoped');
    smallCircles.forEach(smallCircle => smallCircle.classList.toggle('loader__small--stoped'))
};
