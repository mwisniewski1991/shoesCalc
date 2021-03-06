export const state = {
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
        settings: {
            smallScreen: false,
        },
        category:{
            currentSelected: true,
            currentIndex: 1,
            maxIndex: 5,
        }, 
        subcategory:{
            currentSelected: false,
            currentIndex: 1,
            maxIndex: 41,
        },
    },
    minmax:{
        category:{
            currentSelected: true,
            currentIndex: 1,
            maxIndex: 5,
        }, 
        subcategory:{
            currentSelected: false,
            currentIndex: 1,
            maxIndex: 41,
        },
    },
    priceLevel: {
        chart: {},
        settings:{
            selectedSubcategory: false, //for subcategory chart has diffrent settings
            subcategoryPart: 'One', //on screen can be shown only half of data from subcategory
            variable: 'sex',
            sortType: 'median',
            smallScreen: false,
        },
    },
};


export const changeSexbreakdownSettings = (selectionType, option, newValue) => {
    state.sexBreakdown[selectionType][option] = newValue;
};

export const changeMinmaxSettings = (selectionType, option, newValue) =>{
    state.minmax[selectionType][option] = newValue;
};

export const changeBoxplotSettings = (option, newValue) =>{
    state.priceLevel.settings[option] = newValue;
};