import * as d3 from "d3";

export default class Boxplot {

    constructor(id, className, div){

        this.settings= {
            id: `chart-${id}`,
            mainClass: `chart-${className}`,
            container: div,
            dimension: {
                width: div.offsetWidth / 2,
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
            svgWidth: '50%',
            boxplotWidth: 60,
            circleR: 10,
            xLabelRotate: false,
        };

        this.elements= {};

        this.data = {
            rawData: {},
            mainData: {},
        };

        this.labelsName = {
            'F':'F',
            'M':'M',
            'wszystkie':'Wszystkie',
            'klapki-i-sandaly': 'Klapki/sandały', 
            'polbuty': 'Pólbuty', 
            'kozaki-i-inne': 'Kozaki i inne', 
            'sportowe':'Sportowe',
            "japonki":'Japonki',
            "klapki":'Klapki',
            "sandaly":'Sandały',
            "kapcie":'Kapcie',
            "codzienne":'Codzienne',
            "wizytowe":'Wizytowe',
            "glany":'Glany',
            "trampki":'Trampki',
            "buty-trekkingowe-i-trapery":'Trekkingowe',
            "sneakersy":'Sneakersy',
            "mokasyny":'Mokasyny',
            "espadryle":'Espadryle',
            "kalosze":'Kalosze',
            "trekkingi-i-trapery":'Trapery',
            "kozaki":'Kozaki',
            "trzewiki":'Trzewiki',
            "sztyblety":'Sztyblety',
            "sniegowce":'Śniegowce',
            "bieganie":'Do biegania',
            "buty-do-wody":'Buty do wody',
            "fitness":'Fitness',
            "halowki":'Halówki',
            "pilka-nozna":'Piłka nożna',
            "koszykowka":'Koszykówka',
            "tenis":'Tenis',
            "koturny":'Koturny',
            "na-obcasie":'Na obcasie',
            "na-koturnie":'Na koturnie',
            "baleriny":'Baleriny',
            "szpilki":'Szpliki',
            "lordsy":'Lordsy',
            "eleganckie":'Eleganckie',
            "plaskie":'Płaskie',
            "oxfordy":"Oxfordy",
            "botki":'Botki',
            "emu":'Emu',
            "ugg":'Ugg',
            "oficerki":'Oficerki',
            "muszkieterki":'Muszkieterki',
            "kowbojki":'Kowbojki',
            "trampki-i-tenisowki":'Trampki',
        }
    }

    //CONTROLLERS
    renderChart(data, { sortType, selectedSubcategory, subcategoryPart, smallScreen}){
        
        this.updateSettings(selectedSubcategory, smallScreen, false);

        if(!this.elements.svg){this.createBound();
        }else{ this.updateBound(); }

        this.loadData(data);
        this.sortData(sortType);
        this.selectData(selectedSubcategory, subcategoryPart, smallScreen)
        
        if(!this.elements.xAxis){
            this.createXaxis();
            this.createYaxis();
        }else{
            this.redrawXaxis()
            this.redrawYaxis();
        };

        if(!this.elements.gradient){
            this.createGradient();
            this.createGradientLighten();
        };
    
        this.drawDataElements();
    };

    sortChart({ sortType, selectedSubcategory, subcategoryPart, smallScreen }){
        this.updateSettings(selectedSubcategory, smallScreen, false);
        this.sortData(sortType);
        this.selectData(selectedSubcategory, subcategoryPart, smallScreen);
        
        this.redrawXaxis()
        this.redrawYaxis();
        this.drawDataElements();
    };

    resizeChart(newWidth, newheight, {sortType, selectedSubcategory, subcategoryPart, smallScreen}){
        this.settings.dimension.width = newWidth;
        this.settings.dimension.height = newheight;
        this.updateSettings(selectedSubcategory, smallScreen, true);
        this.updateBound()

        this.sortData(sortType);
        this.selectData(selectedSubcategory, subcategoryPart, smallScreen);

        this.redrawXaxis();
        this.redrawYaxis()
        this.drawDataElements();
    }

    //DATA/SETTINGS MANIPULATION
    updateSettings(selectedSubcategory, smallScreen, resizeChart){
        const { container } = this.settings;

        if(smallScreen){
            this.settings.boxplotWidth = selectedSubcategory === false ? 40 : 15; 
            this.settings.circleR = selectedSubcategory === false ? 7 : 4; 
            this.settings.svgWidth = '100%';
            this.settings.dimension.width = container.offsetWidth;  
        }else{
            this.settings.boxplotWidth = selectedSubcategory === false ? 60 : 30; 
            this.settings.circleR = selectedSubcategory === false ? 10 : 5;
            this.settings.svgWidth = selectedSubcategory === false ? '50%' : '100%';
            this.settings.dimension.width = selectedSubcategory === false ? container.offsetWidth / 2 : container.offsetWidth;   
        };
        this.settings.xLabelRotate = selectedSubcategory === false ? false : true;
        this.settings.dimension.margins.bottom = selectedSubcategory === false ? 60 : 120; 

        const newTime = resizeChart === true ? 10 : 300;
        this.settings.animationTime.updateTime = newTime;
    }

    loadData(data){
        this.data.rawData = data;
    };

    sortData(sortType){
        const { data: { rawData } } = this;
        this.data.sortedData = rawData.sort((a,b) => b.value[sortType]-a.value[sortType]);
    }

    selectData(selectedSubcategory, subcategoryPart, smallScreen){

        if(selectedSubcategory){
            if(smallScreen){
                switch(subcategoryPart){
                    case 'One':
                        this.data.mainData = this.data.sortedData.slice(0,11);
                        break;
                    case 'Two':
                        this.data.mainData = this.data.sortedData.slice(11,21);
                        break;
                    case 'Three':
                        this.data.mainData = this.data.sortedData.slice(21,31);
                        break;
                    case 'Four':
                        this.data.mainData = this.data.sortedData.slice(31);
                        break;
                };   
            }else{
                this.data.mainData = subcategoryPart === "One" ? this.data.sortedData.slice(0,21) : this.data.sortedData.slice(21);
            }
        }else{
            this.data.mainData = this.data.sortedData;
        };
    
    }

    //MAIN ELEMENTS
    createBound(){
        this.calcDimension();

        const { mainClass, container, dimension:{ width, height, margins }, svgWidth  } = this.settings;

        const svg = d3.select(container).append('svg')
            .attr('width', svgWidth)
            .classed(`${mainClass}`, true);

        const bound = svg.append('g')
            .classed(`${mainClass}__bound`, true)
            .attr('transform', `translate(${margins.left},${margins.top})`);

        this.elements.svg = svg;
        this.elements.bound = bound;
        
    };

    updateBound(){
        this.calcDimension();
        const { elements:{ bound, svg }, settings:{ dimension:{ margins }, svgWidth } } = this;

        svg.attr('width', svgWidth)
        bound.attr('transform', `translate(${margins.left},${margins.top})`);
    }

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
            .call(d3.axisBottom(xScale));

        xAxis.selectAll('text').text((d)=> this.labelsName[d]);

        if(xLabelRotate) xAxis.selectAll('text').attr("y", 15).attr("x", -20).attr('transform', `translate(0, 20) rotate(-45)`);


        this.elements.xAxis = xAxis;
    }

    redrawXaxis(){
        this.calcXscale();
        const { elements: {xAxis, xScale}, settings:{ animationTime: {updateTime}, xLabelRotate, dimension: {boundHeight}} } = this;

        xAxis.transition().duration(updateTime)
            .attr('transform', `translate(0,${boundHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text').text((d)=> this.labelsName[d]);
        
        if(xLabelRotate) xAxis.selectAll('text').attr("y", 15).attr("x", -20).attr('transform', 'translate(0, 20) rotate(-45)');
    }

    calcXscale(){
        const { dimension:{ boundWidth } } = this.settings;
        const { mainData } = this.data;

        const xScale = d3.scaleBand().paddingInner(1).paddingOuter(.5)
            .domain(mainData.map((el) => el.key))
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
    }

    calcYscale(){

        const { dimension:{boundHeight} } = this.settings;
        const { mainData } = this.data;

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(mainData.map((el)=> el.value.outliersMax))])
            .range([boundHeight,0]);

        this.elements.yScale = yScale;
    }

    //DATA ELEMENTS
    drawDataElements(){
        this.drawVertivalLine();
        this.drawBoxes();
        this.drawMedians();
        this.drawMinLines();
        this.drawMaxLines();
        this.drawOutliersMax();
        this.boxesTooltip()
    }

    drawBoxes(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, boxplotWidth, animationTime: { updateTime } },
                data:{ mainData }
        } = this;

        const className = `${mainClass}__rect`;

        const boxes = bound.selectAll(`.${className}`).data(mainData, (d)=>d.key)
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
                    .attr('width', boxplotWidth)
                ),
                (exit) => exit.remove()
            )
        this.elements.boxes = boxes;
    };

    drawMedians(){
        const { elements:{ bound, xScale, yScale },
                settings:{ mainClass, boxplotWidth,animationTime: { updateTime } },
                data:{ mainData }
        } = this;       
        const className = `${mainClass}__median`;

        const medians = bound.selectAll(`.${className}`).data(mainData, (d)=>d.key)
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
                data:{ mainData }
        } = this;    
        const className = `${mainClass}__minLine`;

        const minLines = bound.selectAll(`.${className}`).data(mainData, (d)=>d.key)
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
                data:{ mainData }
        } = this;    
        const className = `${mainClass}__maxLine`;

        const maxLines = bound.selectAll(`.${className}`).data(mainData, (d)=>d.key)
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
                data:{ mainData }
        } = this;   
        const className = `${mainClass}__verticalLine`;

        const verticalLines = bound.selectAll(`.${className}`).data(mainData, (d)=>d.key)
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
                data:{ mainData },
        } = this;   
        const className = `${mainClass}__outlierMax`;

        //join arrays in one and add key
        const joinedArrData = mainData.reduce((total, keyObject)=> {
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
        // const joinedArrData = mainData.reduce((total, keyObject)=> [...total, ...keyObject.value.outliersMaxArr.reduce((total, shoe)=>[...total, {...shoe, key: keyObject.key}],[])],[]);

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
                        .attr('cx', (d)=> xScale(d.key) + (xScale.bandwidth()/2) - boxplotWidth/2 + Math.random()*boxplotWidth)
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