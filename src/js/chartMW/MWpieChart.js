import * as d3 from "d3";

export default class MWpieChart{
    constructor(name, div){
        this.elements = {
            scales : {},
        }
        this.data = {
            rawData: {},
            pieData: {},
        };
        this.settings = {
            name: name,
            id: `chart-${name}`,
            container: div,            
            dimension: {
                width: {},
                height: {},
                boundedWidth: {},
                boundedheight: {},
                innerWidth: {},
                innerHeight: {},
                margins: {top:0, right:0, bottom:0, left:0, pieMargin: 20},
            },
            animation:{
                aniTime: 500,
            }
        }
    }

    //CONTROLLER ---------------------------------------------------------------------
    renderChart(data){
        this.createSvg();
        this.loadData(data);
    }

    renderVis(z, dataElement, donutRadius=false){
        this.calcPieData();
        this.calcArcGenerator(donutRadius)
        this.createColorScaleSex()
        
        this.createCoreElement(z, dataElement);
        this.drawPie(z, dataElement );

        this.addPieText(this.settings.arcGenerator);
        this.addMainNumber();
    }

    renderVisTwo(z, dataElement, donutRadius=false){
        this.calcPieData();
        this.calcArcGenerator(donutRadius)
        this.createColorScaleSex()
        
        this.createCoreElement(z, dataElement);
        this.drawPie(z, dataElement );

        this.addPieText(this.settings.arcGenerator);
    }

    updateChart(data){
        this.loadData(data);
    }

    updateVis(z, dataElement, donutRadius=false){
        this.calcPieData();
        this.calcArcGenerator(donutRadius)

        this.createCoreElement(z, dataElement);
        this.drawPie(z, dataElement);

        this.addPieText(this.settings.arcGenerator);
        this.addMainNumber();
    }

    //CONTROLLER ---------------------------------------------------------------------

    //MAIN FUNCTION ---------------------------------------------------------------------
    changeSettings(newSet){

        for(const key in newSet){
            this.settings[key] = newSet[key];
        }
    }

    loadData(data){
        this.data.rawData = data;
    }

    calcMainDimension(){

        const { container, dimension: { margins } } = this.settings;

        this.settings.dimension.width = container.getBoundingClientRect().width;
        this.settings.dimension.height = container.getBoundingClientRect().height;

        const { width, height } = this.settings.dimension;

        this.settings.dimension.innerWidth = width - margins.left - margins.right;
        this.settings.dimension.innerHeight = height - margins.top - margins.bottom;


    }

    createSvg(){

        this.calcMainDimension();

        //SVG
        const { id, container, dimension: { width, height, margins }  } = this.settings;

        this.elements.svg  = d3.select(container)
            .append('svg')
            .attr('class', id)
            .attr('width', width)
            .attr('height', height)

        //GROUP 
        const transformX = width/2 - margins.left;
        const transformY = height/2 - margins.top;
        const classNameGroup = `${id}__group`;

        this.elements.svgG = this.elements.svg
            .append('g')
                .attr('class', classNameGroup)
                .attr('transform', `translate(${transformX}, ${transformY})`)
                // .attr("transform", `translate(${margins.left}, ${margins.top})`) //line, scatter
                // .attr('transform', `translate(${width / 2 - margins.left}, ${height / 2 - margins.top})`) //pie

    }
    
    //DATA ELEMENT -------------------------------------------------------------------------------
    createCoreElement(z, dataElement){
        
        const { pieData } = this.data;
        const classSelector = `.${dataElement}${z}`

        this.elements[dataElement] = [];
        this.elements[dataElement][z] = {};
        this.elements[dataElement][z].dataJoin = this.elements.svgG.selectAll(classSelector).data(pieData);
        this.elements[dataElement][z].element = this.elements[dataElement][z].dataJoin.enter().append(dataElement); //path for example
    }

    //PIE/DONUT  -----------------------------------------------------------------------------------
    calcPieData(){
        const data  = this.data.rawData;
        const pieGenerator = d3.pie().value((d)=> d.value);
        this.data.pieData = pieGenerator(d3.entries(data));
    }

    calcArcGenerator(donutRadius){

        const { dimension: { width, height, margins } } = this.settings;
        const innerRadius = donutRadius === false ? 0 : 120;
        const outerRadius = Math.min(width, height) / 2 - margins.pieMargin;

        this.settings.arcGenerator = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
    }

    drawPie(z, dataElement ){

        const { scales: { colorScale } } = this.elements;
        const { id, arcGenerator  } = this.settings;
        const className = `${id}__${dataElement} ${dataElement}${z}`;

        const { element, dataJoin } = this.elements[dataElement][z];
        const fillValue = d => colorScale(d.data.key);

        element
            .attr('class', className)
            .style("opacity", 0)
        .merge(dataJoin)
            .transition().duration(500) 
            .attr('d', arcGenerator)
            .style("stroke", "white")
            .style('fill', fillValue)
            .style("stroke-width", "2px")
            .style("opacity", 0.85)

        dataJoin 
            .exit()
            .transition().duration(500) 
            .style("opacity", 0)
            .remove();
    }
    //PIE/DONUT  -----------------------------------------------------------------------------------
 
    //ADDITIONAL ----------------------------------------------------------------------------------- 
    createColorScale(){

        this.elements.scales.colorScale = d3.scaleOrdinal()
            .domain((data) => data.city)
            .range(d3.schemeSet2);
    }

    createColorScaleSex(){

        this.elements.scales.colorScale = d3.scaleOrdinal()
            .domain(['M','F'])
            .range(['#0984e3','#e84393']);
    }

    addPieText(arcGenerator){

        const { pieData } = this.data;  
        const { svgG } = this.elements;
        const { id } = this.settings;
        const classSelector = `labels`;
        const className = `${id}__labels labels`;

        this.elements.labels = svgG.selectAll(classSelector)
            .data(pieData)
            .enter()
            .append('text')
            .attr('class',className)
            .text((d) => this.changeSexText(d.data.key))
            .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
    }

    addMainNumber(){
        const { rawData } = this.data;  
        const { id } = this.settings;

        let sum = 0;
        for(const key in rawData){sum = sum + rawData[key];};

        const classNameDesc = `${id}__centerText ${id}__centerText--small centerTextDesc`;
        const classNameNumber = `${id}__centerText ${id}__centerText--big centerTextNumber`;

        this.elements.centerTextgroup = this.elements.svgG.append('g')
        const { centerTextgroup} = this.elements;

        this.elements.centerTextDesc = centerTextgroup
            .append('text')
            .attr('class', classNameDesc)
            .text('Total number of shoes:')
            .style('transform','translate(0,-20px)')

        this.elements.centerTextNumber = centerTextgroup
            .append('text')
            .attr('class', classNameNumber)
            .text(sum)
            .style('transform','translate(0, 20px)');


        

    }

    changeSexText(text){

        // if(text==='F'){
        //     return 'Woman';
        // }
        // if(text==='M'){
        //     return 'Man';
        // }else{
        //     return text;
        // }

        switch(text){
            case 'F':
                return 'Woman';
                break;
            case 'M':
                return 'Man';
                break;
            case 'Special':
                return 'Special Price';
                break;
            case 'Regular':
                return 'Regular Price';
                break;
        }
    }
    //ADDITIONAL ----------------------------------------------------------------------------------- 
}