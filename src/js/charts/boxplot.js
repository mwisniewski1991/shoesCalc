import * as d3 from "d3";

export default class Boxplot {

    constructor(id, className, div){

        this.settings= {
            id: `chart-${id}`,
            mainClass: `chart-${className}`,
            container: div,
            dimension: {
                width: div.offsetWidth,
                height: div.offsetHeight,
                boundWidth: {},
                boundHeight: {},
                margins:{
                    left:60, right:20, top:20, bottom:40,
                },
            },
            boxplotWidth: 60,
            animationTime:{
                tooltipTime: 50,
            }
        };

        this.elements= {};

        this.data = {
            rawData: {},
        };
    }

    renderChart(data, { sortType }){
        this.loadData(data);
        this.sortData(data, sortType);

        this.createBound();
        this.createXaxis();
        this.createYaxis();
    
        this.drawVertivalLine();
        this.drawBoxes();
        this.drawMedians();
        this.drawMinLines();
        this.drawMaxLines();

        this.drawOutliersMax();

        this.boxesTooltip()
    };

    loadData(data){
        this.data.rawData = data;
    };

    sortData(data, sortType){
        data.sort((a,b) => b.value[sortType]-a.value[sortType]);
    }

    createBound(){
        this.calcDimension();

        const { mainClass, container, dimension:{width, height, margins},  } = this.settings;

        const svg = d3.select(container).append('svg')
            .classed(`${mainClass}`, true)
            .attr('width', width).attr('height',height);

        const bound = svg.append('g')
            .classed(`${mainClass}__bound`, true)
            .attr('transform', `translate(${margins.left},${margins.top})`)

        this.elements.svg = svg;
        this.elements.bound = bound;
        
    };

    calcDimension(){
        const { width, height, margins } = this.settings.dimension;

        this.settings.dimension.boundWidth = width - margins.left - margins.right;
        this.settings.dimension.boundHeight = height - margins.top - margins.bottom;


    };

    //AXIS ------------------------
    createXaxis(){

        this.calcXscale();
       
        const { bound, xScale } = this.elements;
        const { mainClass, dimension: {boundHeight} } = this.settings;

        const xAxis = bound.append('g')
            .classed(`${mainClass}__xAxis`, true)
            .attr('transform', `translate(0,${boundHeight})`)
            .call(d3.axisBottom(xScale));

        this.elements.xAxis = xAxis;
    }

    calcXscale(){

        const { dimension:{ boundWidth } } = this.settings;
        const { rawData } = this.data;

        const xScale = d3.scaleBand().paddingInner(1).paddingOuter(.5)
            .domain(rawData.map((el) => el.key))
            .range([0, boundWidth]);

        this.elements.xScale = xScale;
    }

    createYaxis(){
        this.calcYscale();

        const { bound, yScale } = this.elements;
        const { mainClass } = this.settings;


        const yAxis = bound.append('g')
            .classed(`${mainClass}__yAxis`, true)
            .call(d3.axisLeft().scale(yScale));


        this.elements.yAxis = yAxis;
    }

    calcYscale(){

        const { dimension:{boundHeight} } = this.settings;
        const { rawData } = this.data;

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(rawData.map((el)=> el.value.outliersMax))])
            .range([boundHeight,0])

        this.elements.yScale = yScale;
    }

    //DATA ELEMENTS
    generateSexClass(key, type, mainClass){
        const sexClass = key === 'M' ? '--male' : '--female'; 
        
        return `${mainClass}__${type} ${mainClass}__${type}${sexClass}`
    }

    drawBoxes(){

        const { bound, xScale, yScale } = this.elements;
        const { mainClass, boxplotWidth } = this.settings;
        const { rawData } = this.data;

        const className = `${mainClass}__rect`;


        const boxes = bound.selectAll(`${className}`).data(rawData)
            .join(
                (enter) => enter
                    .append('rect')
                    // .classed(`${className} ${d.key}`, true)
                    .attr('class', (d) => this.generateSexClass(d.key, 'rect', mainClass))
                    .attr('x', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('y', (d)=> yScale(d.value.q3))
                    .attr('width', boxplotWidth)
                    .attr('height', (d)=> yScale(d.value.q1) - yScale(d.value.q3)),
                (update) => update
                    .attr('x', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('y', (d)=> yScale(d.value.q3))
                    .attr('width', boxplotWidth)
                    .attr('height', (d)=> yScale(d.value.q1) - yScale(d.value.q3)),
                (exit) => exit.remove()
            )
        this.elements.boxes = boxes;
    };

    drawMedians(){
        const { bound, xScale, yScale } = this.elements;
        const { mainClass, boxplotWidth } = this.settings;
        const { rawData } = this.data;
        const className = `${mainClass}__median`;

        const medians = bound.selectAll(className).data(rawData)
            .join(
                (enter) => enter
                    .append('line')
                    .classed(className, true)
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr('y1', (d)=> yScale(d.value.median))
                    .attr('y2', (d)=> yScale(d.value.median)),
                (update) => update
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr('y1', (d)=> yScale(d.value.median))
                    .attr('y2', (d)=> yScale(d.value.median)),
                (exit) => exit.remove()
            );
        this.elements.medians = medians;                
    }       

    drawMinLines(){

        const { bound, xScale, yScale } = this.elements;
        const { mainClass, boxplotWidth } = this.settings;
        const { rawData } = this.data;
        const className = `${mainClass}__minLine`;

        const minLines = bound.selectAll(className).data(rawData)
            .join(
                (enter) => enter
                    .append('line')
                    .classed(className, true)
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr("y1", (d)=> yScale(d.value.min))
                    .attr("y2", (d)=> yScale(d.value.min)),
                (update) => update
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr("y1", (d)=> yScale(d.value.min))
                    .attr("y2", (d)=> yScale(d.value.min)),
                (exit) => exit.remove()
            );
        this.elements.minLines = minLines;
    };

    drawMaxLines(){

        const { bound, xScale, yScale } = this.elements;
        const { mainClass, boxplotWidth } = this.settings;
        const { rawData } = this.data;
        const className = `${mainClass}__maxLine`;

        const maxLines = bound.selectAll(className).data(rawData)
        .join(
            (enter) => enter
                .append('line')
                .classed(className, true)
                .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                .attr("y1", (d)=> yScale(d.value.max))
                .attr("y2", (d)=> yScale(d.value.max)),
            (update) => update
                .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                .attr("y1", (d)=> yScale(d.value.max))
                .attr("y2", (d)=> yScale(d.value.max)),
            (exit) => exit.remove()
        );
        this.elements.maxLines = maxLines;
    };

    drawVertivalLine(){
        const { bound, xScale, yScale } = this.elements;
        const { mainClass } = this.settings;
        const { rawData } = this.data;
        const className = `${mainClass}__verticalLine`;

        const verticalLines = bound.selectAll(className).data(rawData)
        .join(
            (enter) => enter
                .append('line')
                .classed(className, true)
                .attr('x1', (d)=> xScale(d.key))
                .attr('x2', (d)=> xScale(d.key))
                .attr('y1', (d)=> yScale(d.value.min))
                .attr('y2', (d)=> yScale(d.value.max)),
            (update) => update
                .attr('x1', (d)=> xScale(d.key))
                .attr('x2', (d)=> xScale(d.key))
                .attr('y1', (d)=> yScale(d.value.min))
                .attr('y2', (d)=> yScale(d.value.max)),
            (exit) => exit.remove()
        );
        this.elements.verticalLines = verticalLines;
    }

    drawOutliersMax(){

        const { bound, xScale, yScale } = this.elements;
        const { mainClass, boxplotWidth } = this.settings;
        const { rawData } = this.data;
        const className = `${mainClass}__outlierMax`;

        //join arrays in one and add key
        const joinedArrData = rawData.reduce((total, keyObject)=> {
            //first reduce join arrays
            return [
                    ...total, 
                    //second reduce put in every array 'key; 
                    ...keyObject.value.outliersMaxArr.reduce((total, shoe)=>{
                        return [...total, {...shoe, key: keyObject.key}];
                    },[])
            ]
        },[]);
        //above can be in one line but it is too complicated                
        // const joinedArrData = rawData.reduce((total, keyObject)=> [...total, ...keyObject.value.outliersMaxArr.reduce((total, shoe)=>[...total, {...shoe, key: keyObject.key}],[])],[]);

        const outliersMax = bound.selectAll(className).data(joinedArrData)
            .join(
                (enter) => enter
                    .append('circle')
                    .attr('class', (d) => this.generateSexClass(d.sex, 'outlierMax', mainClass))
                    .attr('cx', (d)=> xScale(d.key) + (xScale.bandwidth()/2) - boxplotWidth/2 + Math.random()*boxplotWidth )
                    .attr('cy', (d)=> yScale(d.price))
                    .attr('r', 10)
        );
    }

    //INTERACTIVITY
    boxesTooltip(){
        const { boxes } = this.elements;
        const { animationTime:{ tooltipTime }, container} = this.settings; 
        const tooltip = d3.select('.boxplotTooltip'); 

        boxes.on('mouseover', (d,i,nodes)=>{
            //update labels
            container.querySelector('.boxplotTooltip__value--max').innerText = d.value.max;
            container.querySelector('.boxplotTooltip__value--median').innerText = d.value.median;
            container.querySelector('.boxplotTooltip__value--min').innerText = d.value.min;

            //change tooltip position
            const x = nodes[i].x.baseVal.value;
            const y = nodes[i].y.baseVal.value;
            tooltip
                .style('left', `${x + 45}px`)
                .style('top', `${y + 60}px`)
                .style('visibility','visible')
                .transition().duration(tooltipTime)
                .style('opacity',1);
        })
        .on('mouseout',()=>{
            tooltip
                .transition().duration(tooltipTime)
                .style('opacity',0)
                .transition()
                .style('visibility','hidden');
        })
    }

}