export const sexBreakdownTestData = {
    "M": 30,
    "F": 40,
};

export const sexBreakdownTestDataTwo = {
    "M": 20,
    "F": 60,
};

export const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomSexBreakdownTestData = () => {
    return {
        "M": getRandomIntInclusive(0,1),
        "F": getRandomIntInclusive(10,80),
    }
};

