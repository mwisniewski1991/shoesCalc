export const state = {
    // dataSet: testData,
    shoesList: {
        category: ['wszystkie','klapki-i-sandaly', 'polbuty', 'kozaki-i-inne', 'sportowe'],
        subcategory: [
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
            maxIndex: 41,
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
            maxIndex: 41,
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
            maxIndex: 41,
        },
    },
    priceLevel: {
        chart: {},
        settings:{
            currentVariable: 'sex',
            currentSort: 'median', 
        },
    },
};

export const priceLevelselectVariable = (variable)=>{
    state.priceLevel.settings.currentVariable = variable;
};

export const priceLevelSelectSort = (sortType) =>{
    state.priceLevel.settings.currentSort = sortType;
};
