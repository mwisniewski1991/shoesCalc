import * as d3 from "d3";
// import { svg } from "d3";
// import { curveCatmullRom, select, scaleTime, min, max, axisBottom, timeFormat, scaleLinear, axisLeft, line } from 'd3';
// const moment = require('moment');


export default class ChartMW {
    constructor(name, div){

        this.elements = {
            scales : {},
            axis: {},
        }

        this.data = {
            rawData: {},
            boxPlotData: {},
            histogramBins: {},
            pieData: {},
        };

        this.chartBlocks = {
            linear: {
                scaleBlock: d3.scaleLinear(),
                domainBlock: (data, accessor) => [d3.min(data, accessor), d3.max(data, accessor)],
            },
            linearZero: {
                  scaleBlock: d3.scaleLinear(),  
                  domainBlock: (data, accessor) => [0, d3.max(data, accessor)],
            },
            linearZeroBoxPlot: {
                scaleBlock: d3.scaleLinear(),  
                domainBlock: (data, accessor) => [0, d3.max(data, (d)=> d.value.max)],
            },
            time: {
                scaleBlock :d3.scaleTime(),
                domainBlock: (data, accessor) => [d3.min(data, accessor), d3.max(data, accessor)],
            },
            band: {
                scaleBlock: d3.scaleBand(),
                domainBlock: (data, accessor) => data.map(accessor),
            },
            bandBox:{
                scaleBlock: d3.scaleBand().paddingInner(1).paddingOuter(.5), //FOR BOX PLOT;
                domainBlock: (data, accessor) => data.map(accessor),
                // domainBlock: (data, accessor) => data.map((d) => d.key),
            },
            linearHistX: {
                scaleBlock: d3.scaleLinear(),
                domainBlock: (data, accessor) => [0, 500],
            },
            linearHistY:{
                scaleBlock: d3.scaleLinear(),
                domainBlock : (data, accessor) => [0, d3.max(data, accessor)],
            },
        }

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
                margins: {top:20, right:40, bottom:60, left:80, pieMargin: 20},
            },
            accessors: {},
            
            lineCurve: d3.curveCatmullRom.alpha(.5),
            xTicks: 7,
            bandwidthChange: 20,
            boxPlotWidth: 40,
            animation:{
                aniTime: 500,
            }
        }
    }

    //TESTING
    checkData(){
        const  data  = this.data;
        const { accessors:{xAccessor, yAccessor} } = this.settings;
        
        console.log(data[0]);
        console.log(yAccessor(data[0]))

    }

    //MAIN FUNCTION ---------------------------------------------------------------------
    changeSettings(newSet){

        for(const key in newSet){
            this.settings[key] = newSet[key];
        }
    }

    loadData(data){
        this.data.rawData = data;
    }

    calcMainDimension(chartType){

        const { container, dimension: { margins } } = this.settings;

        if(chartType === 'pie'){ //NEED TO CLEAR MARGINS FOR PIE CHART TO 0 DUE TO CORRECT POSITION OF PLOT
            margins.top = 0;
            margins.right = 0;
            margins.bottom = 0;
            margins.left = 0;
        };

        this.settings.dimension.width = container.getBoundingClientRect().width;
        this.settings.dimension.height = container.getBoundingClientRect().height;

        const { width, height } = this.settings.dimension;

        this.settings.dimension.innerWidth = width - margins.left - margins.right;
        this.settings.dimension.innerHeight = height - margins.top - margins.bottom;


    }

    createSvg(chartType='other'){

        this.calcMainDimension(chartType);

        //SVG
        const { id, container, dimension: { width, height, margins }  } = this.settings;

        this.elements.svg  = d3.select(container)
            .append('svg')
            .attr('class', id)
            .attr('width', width)
            .attr('height', height)


        //GROUP 
        const transformX = chartType === 'pie' ? width/2 - margins.left : margins.left;
        const transformY = chartType === 'pie' ? height/2 - margins.top : margins.top;
        const classNameGroup = `${id}__group`;

        this.elements.svgG = this.elements.svg
            .append('g')
                .attr('class', classNameGroup)
                .attr('transform', `translate(${transformX}, ${transformY})`)
                // .attr("transform", `translate(${margins.left}, ${margins.top})`) //line, scatter
                // .attr('transform', `translate(${width / 2 - margins.left}, ${height / 2 - margins.top})`) //pie

    }
    
    //MAIN FUNCTION ---------------------------------------------------------------------


    //AXIS -------------------------------------------------------------------------------
    createXaxis(x, scaleType){

    this.createAccessor(x, 'x');  

    const data = this.data.rawData;
    
    const { id, dimension:{ innerWidth, innerHeight }, xTicks, accessors:{ xAccessor } } = this.settings;
    const { scaleBlock, domainBlock } = this.chartBlocks[scaleType];
    const className = `${id}__axisLine ${id}__axisLine--xLine`;

    this.elements.scales.xScale = scaleBlock
        .domain(domainBlock(data, xAccessor))
        .range([0, innerWidth])
        // .nice()

    this.elements.axis.xAxisG = this.elements.svgG.append('g')
        .attr('class', className)
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(this.elements.scales.xScale)
            .ticks(xTicks)
            // .tickFormat(d3.timeFormat(timeFormat))
            .tickPadding(10));

    // this.chartGroups[chartType].xAxisG.append('text')
    //     .attr('class','chartLine__axisLabel')
    //     .attr('x', svgWidth/2)
    //     .attr('y',50)
    //     .text(xLabel);    

    }

    createYaxis(y, scaleType){

        this.createAccessor(y, 'y');

        const data = scaleType === "linearHistY" ? this.data.histogramBins : this.data.rawData;

        const { id, xTicks, dimension:{ innerWidth, innerHeight }, accessors:{ yAccessor } } = this.settings;
        const { scaleBlock, domainBlock } = this.chartBlocks[scaleType];
        const className = `${id}__axisLine ${id}__axisLine--yLine`;

        this.elements.scales.yScale = scaleBlock
            .domain(domainBlock(data, yAccessor))
            .range([innerHeight, 0])
            // .nice();         

        this.elements.axis.yAxisG = this.elements.svgG.append('g')
            .attr('class', className)
            .call(d3.axisLeft(this.elements.scales.yScale)
                .ticks(7)
                .tickSize(-innerWidth)
                .tickPadding(10));
        
        // this.elements.axis.yAxisG.append('text')
        //     .attr('class','chartLine__axisLabel')
        //     .attr('class', `${id}__axisLabel`)
        //     .attr('text-anchor', 'middle')
        //     .attr('transform','rotate(-90)')
        //     .attr('x', -innerHeight/2)
        //     .attr('y', -40)
        //     .text(y);            

    }

    createAccessor(accessor, axis){

        if(axis === 'x'){
            this.settings.accessors.xAccessor = (d) => d[accessor]
        }
        if(axis === 'y'){
            this.settings.accessors.yAccessor = (d) => d[accessor]
        }
    }

    calcXaxis(x, scaleType){

        this.createAccessor(x, 'x');  

        const data = this.data.rawData;
        const { scales:{ xScale } } = this.elements;
        const { dimension: { innerHeight }, xTicks, accessors: { xAccessor }  } = this.settings;
        const { domainBlock } = this.chartBlocks[scaleType];

        xScale.domain(domainBlock(data, xAccessor))

        this.elements.axis.xAxisG
            .transition().duration(1000)
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale)
                .ticks(xTicks)
                // .tickFormat(d3.timeFormat(timeFormat))
                .tickPadding(10));

    }

    calcYaxis(y, scaleType){

        this.createAccessor(y, 'y');  

        const data = scaleType === "linearHistY" ? this.data.histogramBins : this.data.rawData;
        const { scales:{ yScale } } = this.elements;
        const { dimension: { innerWidth }, accessors: { yAccessor } } = this.settings;
        const { domainBlock } = this.chartBlocks[scaleType];

        yScale.domain(domainBlock(data, yAccessor))

        this.elements.axis.yAxisG
            .transition().duration(1000)
            .call(d3.axisLeft(yScale)
                .ticks(7)
                .tickSize(-innerWidth)
                .tickPadding(10));
        

        // yAxisG.select('.chartLine__axisLabel').text(y);
    }
    //AXIS -------------------------------------------------------------------------------

    //DATA ELEMENT -------------------------------------------------------------------------------
    createCoreElement(z, dataElement, dataType=''){
        
        const data = this.selectData(dataType);
        const classSelector = `.${dataElement}${z}`

        this.elements[dataElement] = [];
        this.elements[dataElement][z] = {};
        this.elements[dataElement][z].dataJoin = this.elements.svgG.selectAll(classSelector).data(data);
        this.elements[dataElement][z].element = this.elements[dataElement][z].dataJoin.enter().append(dataElement); //path for example
    }

    selectData(dataType){
        let data;

        switch(dataType){
            case 'pie':
                data = this.data.pieData;
                break;
            case 'path':
                data = [this.data.rawData];
                break;
            case 'hist':
                data = this.data.histogramBins;
                break;
            default:
                data = this.data.rawData;
        }
        return data;
    }

    drawLine(x, y, z, dataElement){

        const data  = this.data.rawData;
        const { scales: { xScale, yScale } } = this.elements;
        const { id } = this.settings;
        const className = `${id}__${dataElement} ${dataElement}${z}`;

        
        // this.elements.paths[z] = {};
        // this.elements.paths[z].dataJoin = this.elements.svgG.selectAll(`.path${z}`).data([data]);
        // this.elements.paths[z].path = this.elements.paths[z].dataJoin.enter().append('path');

        const { element, dataJoin } = this.elements[dataElement][z];

        const lineGenerator = d3.line()
                                    .x(d => xScale(d[x]))
                                    .y(d => yScale(d[y]))
                                    .curve(d3.curveCatmullRom.alpha(.5));

        // const lineGeneratorZero = d3.line()
        //     .x(d => xScale(d[x]))
        //     .y(d => yScale(0))
        //     .curve(d3.curveCatmullRom.alpha(.5)); IDEA FOR ANIMATION
            
        element
            .attr('opacity', 1)
            .attr('class', className)
        .merge(dataJoin)
            .transition()
            .duration(1000)   
            .attr('opacity', 1)
            .attr("d", lineGenerator(data)); 

        dataJoin
            .exit()
            .transition().duration(500) 
            .attr("opacity", 0)
            .remove();
    }

    drawDots(x, y, z, dataElement){

        const { scales: { xScale, yScale } } = this.elements;
        const { id } = this.settings;
        const className = `${id}__${dataElement} ${dataElement}${z}`;
        const { element, dataJoin } = this.elements[dataElement][z];

        const cxValue = (d) => xScale(d[x]);
        const cyValue = (d) => yScale(d[y]);

        element 
            .attr('class', className)
            .attr("cx", cxValue)
            .attr("cy", cyValue)
            .attr("r", 1)
        .merge(dataJoin)
            .transition().duration(1000)  
                .attr('opacity', 1)
                .attr("cx", cxValue)
                .attr("cy", cyValue)
                .attr("r", 6);
    
        dataJoin 
            .exit()
            .transition().duration(500) 
            .attr("r", 0)
            .remove();
    }

    drawRects(x, y, z, dataElement, horizontal=false){
        // x, y, z=which gropu elements 

        const { scales: { xScale, yScale }  } = this.elements;
        const { id, dimension: { innerHeight, innerWidth }, bandwidthChange } = this.settings;
        const className = `${id}__${dataElement} ${dataElement}${z}`
        const { element, dataJoin } = this.elements[dataElement][z];

        if(!horizontal){
            //VERTICAL
            const xValue = (d) => xScale(d[x]) + bandwidthChange/2;
            const yValue = (d) => yScale(d[y]);
            const width = xScale.bandwidth() - bandwidthChange;
            const height = (d) => innerHeight - yScale(d[y])
            const fillValue = "#69b3a2"

            element
                .attr('class', className)
                .attr("x", xValue)
                .attr("y", yValue)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", fillValue)
            .merge(dataJoin)
                .transition().duration(1000)  
                .attr("x", xValue)
                .attr("y", yValue)
                .attr("height", height)
                .attr("width", width)

            dataJoin 
                .exit()
                .transition().duration(500) 
                    .attr("width", 0)
                    .attr("height", 0)
                .remove();

        }else{
            //HORIZONTAL
            const xValue = xScale(0);
            const yValue = (d) => yScale(d[y]) + bandwidthChange/2;
            const width = (d)=> xScale(d[x]);
            const height = yScale.bandwidth() - bandwidthChange

            element
                .attr('class', className)
                .attr("x", xValue)
                .attr("y", yValue)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "#69b3a2")
            .merge(dataJoin)
                .transition().duration(1000) 
                .attr("x", xValue)
                .attr("y", yValue) 
                .attr("width", width)
                    
            dataJoin 
                .exit()
                .transition().duration(500) 
                    .attr("width", 0)
                    .attr("height", 0)
                .remove();
        }
    }
    //DATA ELEMENT -------------------------------------------------------------------------------

    //BOX PLOT -----------------------------------------------------------------------------------
    loadBoxPlotData(data){
        this.data.boxPlotData = data;


    }
    calcBoxPlotData(x, y){
        
        const data = this.data.rawData;
        
        this.data.boxPlotData = d3.nest()
            .key((d) => d[x])
            .rollup((d) => {
                const q1 = d3.quantile(d.map((g) => g[y]).sort(d3.ascending), .25)
                const median = d3.quantile(d.map((g) => g[y]).sort(d3.ascending), .5)
                const q3 = d3.quantile(d.map((g) => g[y]).sort(d3.ascending), .75)
                const interQuantileRange = q3 - q1
                // const min = q1 - 1.5 * interQuantileRange
                // const max = q1 + 1.5 * interQuantileRange
                const min = d3.min(d.map((g) => g[y]))
                const max = d3.max(d.map((g) => g[y]))

                return {q1, median, q3, interQuantileRange, min, max}
            })
            .entries(data)
    }

    createCoreBoxplotElement(z, dataElement, boxPlotElement){

        const data = this.data.boxPlotData;
        const classSelector = `.${boxPlotElement}${z}`

        this.elements[boxPlotElement] = [];
        this.elements[boxPlotElement][z] = {};
        this.elements[boxPlotElement][z].dataJoin = this.elements.svgG.selectAll(classSelector).data(data);
        this.elements[boxPlotElement][z].element = this.elements[boxPlotElement][z].dataJoin.enter().append(dataElement); //path for example

        // console.log(classSelector);
        // console.log(this.elements);
    }

    // createCoreBoxplot(z){
    //     this.createCoreBoxplotElement(z,'line', 'verline');
    //     this.createCoreBoxplotElement(z,'rect', 'rect');
    //     this.createCoreBoxplotElement(z,'line', 'median');
    //     this.createCoreBoxplotElement(z,'line', 'minline');
    //     this.createCoreBoxplotElement(z,'line', 'maxline');

    // }

    drawBoxes(z){
        this.createCoreBoxplotElement(z,'line', 'verline');
        this.createCoreBoxplotElement(z,'rect', 'rect');
        this.createCoreBoxplotElement(z,'line', 'median');
        this.createCoreBoxplotElement(z,'line', 'minline');
        this.createCoreBoxplotElement(z,'line', 'maxline');


        this.drawBoxPlotVerLines(z, 'line', 'verline');
        this.drawBoxPlotBoxes(z, 'rect', 'rect');
        this.drawBoxPlotMedians(z, 'line', 'median');
        this.drawBoxPlotMin(z, 'line', 'minline');
        this.drawBoxPlotMax(z, 'line', 'maxline');
    }

    drawBoxPlotVerLines(z, dataElement, boxPlotElement){

        const { scales: { xScale, yScale } } = this.elements;
        const { id, boxPlotWidth, animation: { aniTime } } = this.settings;
        const className = `${id}__${boxPlotElement} ${boxPlotElement}${z}`

        // this.elements.boxPlotLines[z] = {};
        // this.elements.boxPlotLines[z].dataJoin = this.elements.svgG.selectAll(`.boxPlotLines${z}`).data(boxPlotData)
        // this.elements.boxPlotLines[z].lines = this.elements.boxPlotLines[z].dataJoin.enter().append('line')
    
        const { element, dataJoin } = this.elements[boxPlotElement][z];
        const x1 =(d)=> xScale(d.key)
        const y1 = (d)=> yScale(d.value.min)
        const y2 = (d)=> yScale(d.value.max)

        element
            .attr('class', className)
            .attr('x1', x1)
            .attr('x2', x1)
            .attr('y1', y1)
            .attr('y2', y2)
            .attr('width', 40)
            .attr('stroke','black')
        .merge(dataJoin)
            .transition().duration(aniTime)  
                .attr('x1', x1)
                .attr('x2', x1)
                .attr('y1', y1)
                .attr('y2', y2)
                .attr('width', 40)

        dataJoin
            .exit()
            .transition().duration(aniTime) 
            .remove();
}

    drawBoxPlotBoxes(z, dataElement, boxPlotElement){    

        const { scales: { xScale, yScale } } = this.elements;
        const { id, boxPlotWidth, animation: { aniTime } } = this.settings;
        const className = `${id}__${boxPlotElement} ${boxPlotElement}${z}`;

        // this.elements.boxPlotRects[z] = {};
        // boxPlotRects[z].dataJoin = svgG.selectAll(`.boxPlotRects${z}`).data(boxPlotData)
        // boxPlotRects[z].rects = boxPlotRects[z].dataJoin.enter().append('rect')
        
        const { element, dataJoin } = this.elements[boxPlotElement][z];
        const x = (d) => xScale(d.key) - boxPlotWidth/2;
        const y = (d) => yScale(d.value.q3);
        const h = (d) => yScale(d.value.q1) - yScale(d.value.q3);
        const w = boxPlotWidth;

        element
            .attr('class', className)
            .attr("x", x)
            .attr("y", y)
            .attr("height", h)
            .attr("width", w)
            .attr("stroke", "black")
            .attr('opacity', 0)
            // .style("fill", "#69b3a2")
        .merge(dataJoin)
            .transition().duration(aniTime)  
                .attr("x", x)
                .attr("y", y)
                .attr("height", h)
                .attr("width", w)
                .attr("stroke", "black")
                .attr('opacity', 1)

        dataJoin 
            .exit()
            .transition().duration(aniTime) 
            .attr("width", 0)
            .remove();
}

    drawBoxPlotMedians(z, dataElement, boxPlotElement){

        const { scales: { xScale, yScale } } = this.elements;
        const { id, boxPlotWidth, animation: { aniTime } } = this.settings;
        const className = `${id}__${boxPlotElement} ${boxPlotElement}${z}`;

        // this.elements.boxPlotHorLines[z] = {};
        // this.elements.boxPlotHorLines[z].dataJoin = this.elements.svgG.selectAll(`.boxPlotHorLines${z}`).data(boxPlotData);
        // this.elements.boxPlotHorLines[z].median = this.elements.boxPlotHorLines[z].dataJoin.enter().append('line');

        const { element, dataJoin } = this.elements[boxPlotElement][z];
        const x1 = (d)=> xScale(d.key)-boxPlotWidth/2
        const x2 = (d)=> xScale(d.key)+boxPlotWidth/2
        const y1 = (d)=> yScale(d.value.median)

        element
            .attr('class', className)
            .attr('x1', x1)
            .attr('x2', x2)
            .attr('y1', y1)
            .attr('y2', y1)
            .attr('stroke','black')
            .attr('width', 40)
        .merge(dataJoin)
            .transition().duration(aniTime)
                .attr('x1', x1)
                .attr('x2', x2)
                .attr('y1', y1)
                .attr('y2', y1)
                .attr('stroke','black')
                .attr('width', 40)

        dataJoin
            .exit()
            .transition().duration(aniTime) 
            .remove();
    }

    drawBoxPlotMin(z, dataElement, boxPlotElement){

        const { scales: { xScale, yScale } } = this.elements;
        const { id, boxPlotWidth, animation: { aniTime } } = this.settings;
        const className = `${id}__${boxPlotElement} ${boxPlotElement}${z}`;

        //MIN
        // this.elements.boxPlotMin[z] = {};
        // this.elements.boxPlotMin[z].dataJoin = this.elements.svgG.selectAll(`.boxPlotMin${z}`).data(boxPlotData)
        // this.elements.boxPlotMin[z].min = this.elements.boxPlotMin[z].dataJoin.enter().append('line')

        const { element, dataJoin } = this.elements[boxPlotElement][z];
        const x1 = (d)=> xScale(d.key)-boxPlotWidth/2;
        const x2 = (d)=> xScale(d.key)+boxPlotWidth/2;
        const y1 = (d) => yScale(d.value.min); //y2 not necessery

        element
            .attr('class', className)
            .attr('x1', x1)
            .attr('x2', x2)
            .attr("y1", y1)
            .attr("y2", y1)
            .attr('stroke','black')
            .attr('width', 40)
        .merge(dataJoin)
            .transition().duration(aniTime)
                .attr('x1', x1)
                .attr('x2', x2)
                .attr("y1", y1)
                .attr("y2", y1)
                .attr('stroke','black')
                .attr('width', 40)

        dataJoin
            .exit()
            .transition().duration(aniTime) 
            .remove();
    }

    drawBoxPlotMax(z, dataElement, boxPlotElement){

        const { scales: { xScale, yScale } } = this.elements;
        const { id, boxPlotWidth, animation: { aniTime } } = this.settings;
        const className = `${id}__${boxPlotElement} ${boxPlotElement}${z}`;

        // this.elements.boxPlotMax[z] = {};
        // this.elements.boxPlotMax[z].dataJoin = this.elements.svgG.selectAll(`.boxPlotMax${z}`).data(boxPlotData)
        // this.elements.boxPlotMax[z].max = this.elements.boxPlotMax[z].dataJoin.enter().append('line')

        const { element, dataJoin } = this.elements[boxPlotElement][z];
        const x1 = (d)=> xScale(d.key)-boxPlotWidth/2;
        const x2 = (d)=> xScale(d.key)+boxPlotWidth/2;
        const y1 = (d) => yScale(d.value.max); //y2 not necessery

        element
            .attr('class', className)
            .attr('x1', x1)
            .attr('x2', x2)
            .attr("y1", y1)
            .attr("y2", y1)
            .attr('stroke','black')
            .attr('width', 40)
        .merge(dataJoin)
            .transition().duration(aniTime)
                .attr('x1', x1)
                .attr('x2', x2)
                .attr("y1", y1)
                .attr("y2", y1)
                .attr('stroke','black')
                .attr('width', 40)


        dataJoin
            .exit()
            .transition().duration(aniTime) 
            .remove();
    }

    drawBoxPlotDots(x, y, z, dataElement){

        const { scales: { xScale, yScale } } = this.elements;
        const { id, boxPlotWidth, animation: { aniTime } } = this.settings;
        const className = `${id}__${dataElement} ${dataElement}${z}`;

        // this.elements.boxPlotDots[z] = {};
        // this.elements.boxPlotDots[z].dataJoin = this.elements.svgG.selectAll(`.boxPlotDots${z}`).data(data)
        // this.elements.boxPlotDots[z].dots = this.elements.boxPlotDots[z].dataJoin.enter().append('circle');
        
        const { element, dataJoin } = this.elements[dataElement][z];
        const cx = (d) => (xScale(d[x]) + (xScale.bandwidth()/2) - boxPlotWidth/2 + Math.random()*boxPlotWidth )
        const cy = (d) => yScale(d[y])

        element 
        .attr('class', className)
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 0)
        .merge(dataJoin)
            .transition().duration(aniTime)  
                .attr('opacity', 1)
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", 4)
             
        dataJoin 
            .exit()
            .transition().duration(aniTime) 
            .attr("r", 0)
            .remove();
    }

    //PIE/DONUT  -----------------------------------------------------------------------------------
    calcPieData(){
        const data  = this.data.rawData;
        const pieGenerator = d3.pie().value((d)=> d.value);
        this.data.pieData = pieGenerator(d3.entries(data));
    }

    drawPie(z, dataElement, donutRadius=false){
        this.createColorScaleSex()

        const { scales: { colorScale } } = this.elements;
        const { id, dimension: { width, height, margins }  } = this.settings;
        const className = `${id}__${dataElement} ${dataElement}${z}`;

        const innerRadius = donutRadius === false ? 0 : 120;
        const outerRadius = Math.min(width, height) / 2 - margins.pieMargin;


        const { element, dataJoin } = this.elements[dataElement][z];
        const fillValue = d => colorScale(d.data.key);
        const arcGenerator = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)

        element
            .attr('class', className)
            // .attr('d', arcGenerator)
            // .style("stroke", "white")
            // .style('fill', fillValue)
            // .style("stroke-width", "2px")
            // .style("opacity", 0.7)
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

        
        this.addPieText(arcGenerator);
    }

    addPieText(arcGenerator){

        const { pieData } = this.data;  

        this.elements.svgG.selectAll('mySlices')
            .data(pieData)
            .enter()
            .append('text')
            .text((d) => this.changeSexText(d.data.key))
            .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", 16)
    }

    changeSexText(text){
        if(text==='F'){
            return 'Woman shoes'
        }else{
            return 'Man shoes'
        }
    }

    createColorScale(){
  
        const data = this.data;
        const { xAccessor } = this.settings.accessors;

        this.elements.scales.colorScale = d3.scaleOrdinal()
            .domain((data) => data.city)
            .range(d3.schemeSet2);
    }

    createColorScaleSex(){

        this.elements.scales.colorScale = d3.scaleOrdinal()
            .domain(['M','F'])
            .range(['#0984e3','#e84393']);
    }
    //PIE/DONUT  -----------------------------------------------------------------------------------

    //HISTOGRAM  -----------------------------------------------------------------------------------
    calcHistData(x, nBins){
        const data  = this.data.rawData;
        const { scales: { xScale, yScale } } = this.elements;

        const histogram = d3.histogram()
            .value( (d) => d[x]) 
            .domain(xScale.domain())
            .thresholds(xScale.ticks(nBins));

        this.data.histogramBins = histogram(data);
        console.log(this.data.histogramBins);
    }

    drawRectsHist(x, z, dataElement){

        const { scales: { xScale, yScale }  } = this.elements;
        const { id, dimension: { innerHeight, innerWidth }, bandwidthChange, width, height } = this.settings;
        const className = `${id}__${dataElement} ${dataElement}${z}`
        const { element, dataJoin } = this.elements[dataElement][z];

        element
            .attr('class', className)
            .attr("x", 1)
            .attr("transform", (d) => "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")")
            .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - 1)
            .attr("height", (d) =>  innerHeight - yScale(d.length))
            // .style("fill", "#69b3a2")
            // .style("fill", (d) => d.x0 < 140 ? 'yellow' : '#69b3a2')
        .merge(dataJoin)
            .transition().duration(1000)  
            .attr("x", 1)
            .attr("transform", (d) => "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")")
            .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - 1)
            .attr("height", (d) =>  innerHeight - yScale(d.length));

        dataJoin
            .exit()
            .transition().duration(500) 
                .attr("width", 0)
                .attr("height", 0)
            .remove();

    }
    //HISTOGRAM  -----------------------------------------------------------------------------------


    //OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD
    //OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD OLD 
    redrawChart(dataObj){

        const { chartType, xLabel } = dataObj;
        const data = [dataObj.dataSets[0].data, dataObj.dataSets[1].data];
        const setUp = [
            ...dataObj.dataSets[0].setUp.filter(el => el.show === true), 
            ...dataObj.dataSets[1].setUp.filter(el => el.show === true)];

        const { div } = this.chartGroups[chartType];
        const { height, width } = document.querySelector(div).getBoundingClientRect()

        const margin = this.chartSettings.margins;
        const svgWidth = width - margin.left - margin.right;
        const svgHeight = height - margin.top - margin.bottom;

        this.chartGroups[chartType].svg
                                    .attr('width', width)
                                    .attr('height', height);

        //X AXIS    
        this.chartGroups[chartType].xScale.range([0, svgWidth])

        this.chartGroups[chartType].xAxisG
                                    .attr('class', 'chartLine__axisLine')
                                    .attr('transform', `translate(0, ${svgHeight})`)
                                    .call(d3.axisBottom(this.chartGroups[chartType].xScale)
                                        .ticks(7)
                                        .tickFormat(d3.timeFormat("%d.%m"))
                                        .tickPadding(10));

        this.chartGroups[chartType].xAxisG.select('chartLine__axisLabel')
                .attr('x', svgWidth/2)
                .attr('y', 50)
                .text(xLabel);  

        //Y AXIS    
        this.chartGroups[chartType].yScale.range([svgHeight, 0])
        this.chartGroups[chartType].yAxisG
                                    .attr('class', 'chartLine__axisLine chartLine__axisLine--yLine')
                                    .call(d3.axisLeft(this.chartGroups[chartType].yScale)
                                        .ticks(7)
                                        .tickSize(-svgWidth)
                                        .tickPadding(10));

        //DATA

        this.chartGroups[chartType].paths.forEach( (path, index) =>{

                    const x = setUp[index].x;
                    const y = setUp[index].y;
                    const xValue =  (d) => d[x];
                    const yValue =  (d) => d[y];

                path
                    .attr("d", d3.line()
                    .x((d) => this.chartGroups[chartType].xScale(xValue(d)))
                    .y((d) => this.chartGroups[chartType].yScale(yValue(d)))
                    .curve(this.chartSettings.lineCurve));
            });

        this.chartGroups[chartType].dots.forEach( (dot, index) =>{

                const x = setUp[index].x;
                const y = setUp[index].y;
                const xValue =  (d) => d[x];
                const yValue =  (d) => d[y];

                dot
                .attr("cx", (d) => this.chartGroups[chartType].xScale(xValue(d)))
                .attr("cy", (d) => this.chartGroups[chartType].yScale(yValue(d)))
        });

    }

    calcMinValue(datasets, setUp){

        const datasetsValues = [];

        datasets.forEach((data,index) => {


            setUp[index].forEach((el) => {
                
                const variable = el.y;
                const tempValues = data.map(el => parseFloat(el[variable]));         
                datasetsValues.push(...tempValues);
            })
        });

        const buffer = 0;
        const minValue = d3.min(datasetsValues) + (d3.min(datasetsValues) * buffer);
        
        return minValue;
    }

    calcMaxValue(datasets, setUp){
        const datasetsValues = [];

        datasets.forEach((data,index) => {

            setUp[index].forEach((el) => {
                const variable = el.y;
                const tempValues = data.map(el => parseFloat(el[variable]));         
                datasetsValues.push(...tempValues);
            })
        });

        const buffer = 0;
        const maxValue = d3.max(datasetsValues) + (d3.max(datasetsValues) * buffer)

        return maxValue;
    }

}