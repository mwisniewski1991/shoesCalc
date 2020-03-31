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
                    left:60, right:20, top:20, bottom:60,
                },
            },
            animationTime:{
                updateTime: 300,
                tooltipTime: 50,
            },
            boxplotWidth: 60,
            circleR: 5,
            xLabelRotate: false,
        };

        this.elements= {};

        this.data = {
            rawData: {},
        };
    }

    //CONTROLLERS
    renderChart(data, { currentSort, selectedSubcategory}){
        this.loadData(data);
        this.sortData(currentSort);
        this.updateSettings(selectedSubcategory);
        
        this.createBound();
        this.createXaxis();
        this.createYaxis();
        this.createGradient();
        this.createGradientLighten();
    
        this.drawVertivalLine();
        this.drawBoxes();
        this.drawMedians();
        this.drawMinLines();
        this.drawMaxLines();
        this.drawOutliersMax();

        this.boxesTooltip()
    };

    updateChart(data, { currentSort, selectedSubcategory}){
        this.loadData(data);
        this.sortData(currentSort);
        this.updateSettings(selectedSubcategory);

        this.redrawXaxis()
        this.redrawYaxis();

        this.drawVertivalLine();
        this.drawBoxes();
        this.drawMedians();
        this.drawMinLines();
        this.drawMaxLines();
        this.drawOutliersMax();

        this.boxesTooltip()

    }

    sortChart({ currentSort }){
        this.sortData(currentSort);
        this.redrawXaxis()

        this.drawVertivalLine();
        this.drawBoxes();
        this.drawMedians();
        this.drawMinLines();
        this.drawMaxLines();
        this.drawOutliersMax();
    }

    //MAIN ELEMENTS
    loadData(data){
        this.data.rawData = data;
    };

    sortData(currentSort){
        const { data: { rawData } } = this;
        rawData.sort((a,b) => b.value[currentSort]-a.value[currentSort]);
    }

    updateSettings(selectedSubcategory){

        this.settings.boxplotWidth = selectedSubcategory === false ? 60 : 30; 
        this.settings.circleR = selectedSubcategory === false ? 10 : 5; 
        this.settings.xLabelRotate = selectedSubcategory === false ? false : true; 

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
        const { mainClass, dimension: {boundHeight}, xLabelRotate } = this.settings;

        const xAxis = bound.append('g')
            .classed(`${mainClass}__xAxis`, true)
            .attr('transform', `translate(0,${boundHeight})`)
            .call(d3.axisBottom(xScale))

        if(xLabelRotate) xAxis.selectAll('text').attr("y", 15).attr("x", -20).attr('transform', "rotate(-45)");

        this.elements.xAxis = xAxis;
    }

    redrawXaxis(){
        this.calcXscale();
        const { elements: { xAxis, xScale }, settings:{ animationTime: { updateTime }, xLabelRotate} } = this;

        xAxis.transition().duration(updateTime).call(d3.axisBottom(xScale))

        if(xLabelRotate) xAxis.selectAll('text').attr("y", 15).attr("x", -20).attr('transform', "rotate(-45)");


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

    redrawYaxis(){
        this.calcYscale();

        const { elements: { yAxis, yScale }, settings:{ animationTime: { updateTime } }  } = this; 

        yAxis.transition().duration(updateTime).call(d3.axisLeft(yScale));
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
    drawBoxes(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, boxplotWidth, animationTime: { updateTime } },
                data:{ rawData }
        } = this;

        const className = `${mainClass}__rect`;

        const boxes = bound.selectAll(`.${className}`).data(rawData, (d)=>d.key)
            .join(
                (enter) => enter
                    .append('rect')
                    .attr('class', (d) => this.generateSexClass(d.key, 'rect', mainClass))
                    .attr('x', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('y', (d)=> yScale(d.value.q3))
                    .attr('width', boxplotWidth)
                    .attr('height', (d)=> yScale(d.value.q1) - yScale(d.value.q3)),
                (update) => update.call(
                    (update)=> update.transition().duration(updateTime)
                    .attr('x', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('y', (d)=> yScale(d.value.q3))
                    .attr('height', (d)=> yScale(d.value.q1) - yScale(d.value.q3))
                ),
                (exit) => exit.remove()
            )
        this.elements.boxes = boxes;
    };

    drawMedians(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, boxplotWidth,animationTime: { updateTime } },
                data:{ rawData }
        } = this;       
        const className = `${mainClass}__median`;

        const medians = bound.selectAll(`.${className}`).data(rawData, (d)=>d.key)
            .join(
                (enter) => enter
                    .append('line')
                    .classed(className, true)
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr('y1', (d)=> yScale(d.value.median))
                    .attr('y2', (d)=> yScale(d.value.median)),
                (update) => update
                    .call((update)=>update.transition().duration(updateTime)
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr('y1', (d)=> yScale(d.value.median))
                    .attr('y2', (d)=> yScale(d.value.median))
                    ),
                (exit) => exit.remove()
            );
        this.elements.medians = medians;                
    }       

    drawMinLines(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, boxplotWidth, animationTime: { updateTime } },
                data:{ rawData }
        } = this;    
        const className = `${mainClass}__minLine`;

        const minLines = bound.selectAll(`.${className}`).data(rawData, (d)=>d.key)
            .join(
                (enter) => enter
                    .append('line')
                    .classed(className, true)
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr("y1", (d)=> yScale(d.value.min))
                    .attr("y2", (d)=> yScale(d.value.min)),
                (update) => update
                    .call((update)=> update.transition().duration(updateTime)
                        .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                        .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                        .attr("y1", (d)=> yScale(d.value.min))
                        .attr("y2", (d)=> yScale(d.value.min))
                    ),
                (exit) => exit.remove()
            );
        this.elements.minLines = minLines;
    };

    drawMaxLines(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, boxplotWidth, animationTime: { updateTime } },
                data:{ rawData }
        } = this;    
        const className = `${mainClass}__maxLine`;

        const maxLines = bound.selectAll(`.${className}`).data(rawData, (d)=>d.key)
        .join(
            (enter) => enter
                .append('line')
                .classed(className, true)
                .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                .attr("y1", (d)=> yScale(d.value.max))
                .attr("y2", (d)=> yScale(d.value.max)),
            (update) => update
                .call((update)=> update.transition().duration(updateTime)
                    .attr('x1', (d)=> xScale(d.key) - boxplotWidth/2)
                    .attr('x2', (d)=> xScale(d.key) + boxplotWidth/2)
                    .attr("y1", (d)=> yScale(d.value.max))
                    .attr("y2", (d)=> yScale(d.value.max))
                ),
            (exit) => exit.remove()
        );
        this.elements.maxLines = maxLines;
    };

    drawVertivalLine(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, animationTime: { updateTime } },
                data:{ rawData }
        } = this;   
        const className = `${mainClass}__verticalLine`;

        const verticalLines = bound.selectAll(`.${className}`).data(rawData, (d)=>d.key)
        .join(
            (enter) => enter
                .append('line')
                .classed(className, true)
                .attr('x1', (d)=> xScale(d.key))
                .attr('x2', (d)=> xScale(d.key))
                .attr('y1', (d)=> yScale(d.value.min))
                .attr('y2', (d)=> yScale(d.value.max)),
            (update) => update
                .call((update) => update.transition().duration(updateTime)
                    .attr('x1', (d)=> xScale(d.key))
                    .attr('x2', (d)=> xScale(d.key))
                    .attr('y1', (d)=> yScale(d.value.min))
                    .attr('y2', (d)=> yScale(d.value.max))
                ),
            (exit) => exit.remove()
        );
        this.elements.verticalLines = verticalLines;
    }

    drawOutliersMax(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, boxplotWidth, circleR, animationTime:  { updateTime } },
                data:{ rawData }
        } = this;   
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

        const outliersMax = bound.selectAll(`.${className}`).data(joinedArrData, (d)=>d.key)
            .join(
                (enter) => enter
                    .append('circle')
                    .attr('class', (d) => this.generateSexClass(d.sex, 'outlierMax', mainClass))
                    .attr('cx', (d)=> xScale(d.key) + (xScale.bandwidth()/2) - boxplotWidth/2 + Math.random()*boxplotWidth )
                    .attr('cy', (d)=> yScale(d.price))
                    .attr('r', circleR),
                (update) => update
                    .call((update)=>update.transition().duration(updateTime)
                        .attr('cx', (d)=> xScale(d.key) + (xScale.bandwidth()/2) - boxplotWidth/2 + Math.random()*boxplotWidth )
                        .attr('cy', (d)=> yScale(d.price))
                        .attr('r', circleR)),
                (exit) => exit.remove()
            );

        this.elements.outliersMax = outliersMax;
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
                .style('opacity',1);
        })
        .on('mouseout',()=>{
            tooltip
                .style('left', `-150px`)
                .style('opacity',0)
        })
    }

    //ADDITIONAL
    generateSexClass(key, type, mainClass){
        const sexClass = key === 'M' ? '--male' : key==="F" ? '--female' : '--other'; 
        
        return `${mainClass}__${type} ${mainClass}__${type}${sexClass}`
    }

    createGradient(){

        const { svg } = this.elements;
        const defs = svg.append("defs");
        
        const gradient = defs.append("linearGradient")
            .attr("id", "boxGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "20%")
            .attr("y2", "80%");

            gradient.append("stop")
            .attr('class', 'start')
            .attr("offset", "40%")
            .attr("stop-color", "#0984e3")
            .attr("stop-opacity", 1);

            gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "60%")
            .attr("stop-color", "#e84393")
            .attr("stop-opacity", 1);

        this.elements.gradient = defs;
    }

    createGradientLighten(){

        const { svg } = this.elements;
        const defs = svg.append("defs");
        
        const gradient = defs.append("linearGradient")
            .attr("id", "boxGradientLighten")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "20%")
            .attr("y2", "80%");

            gradient.append("stop")
            .attr('class', 'start')
            .attr("offset", "40%")
            .attr("stop-color", "#1a96f6")
            .attr("stop-opacity", 1);

            gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "60%")
            .attr("stop-color", "#ec63a5")
            .attr("stop-opacity", 1);

        this.elements.gradientLighten = defs;
    }
}