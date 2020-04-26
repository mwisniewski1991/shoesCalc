import * as d3 from "d3";

export default class PieChart{
    constructor(id, mainClass, div){
        this.elements = {
            container: div,            
            scales : {},
        }
        this.data = {
            rawData: {},
            pieData: {},
        };
        this.settings = {
            name: id,
            id: `chart-${id}`,
            mainClass: `chart-${mainClass}`,
            // container: div,            
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
    renderChart(data, { smallScreen }){
        this.createSvg();

        this.loadData(data);
        this.calcPieData();
        this.createArcGenerator(smallScreen);

        this.drawPie();
        this.addLabels();
        this.addNumbersLabels();
        this.addMainNumber();

        this.addHoverEffect(smallScreen);

    }
    
    updateChart(data, { smallScreen }){
        this.loadData(data);
        this.calcPieData();
        this.createArcGenerator(smallScreen)

        this.drawPie();
        this.updateLabels();
        this.updateNumberLabels();
        this.updateMainNumber();
    }

    resizeChart(newWidth, newHeight, { smallScreen }){
        this.settings.dimension.width = newWidth;
        this.settings.dimension.height = newHeight;
        
        this.calcMainDimension();
        this.createArcGenerator(smallScreen)

        this.repositionPieContainer()
        this.drawPie();
        this.updateLabels();
        this.updateNumberLabels();
        this.updateMainNumber();

        this.addHoverEffect(smallScreen);
    }

    //MAIN FUNCTION ---------------------------------------------------------------------
    loadData(data){
        this.data.rawData = data;
    }

    calcMainDimension(){
        const { container } = this.elements;
        this.settings.dimension.width = container.getBoundingClientRect().width;
        this.settings.dimension.height = container.getBoundingClientRect().height;
    }

    createSvg(){
        this.calcMainDimension();

        //SVG
        const { container } = this.elements;
        const { mainClass, dimension: { width, height, margins }  } = this.settings;
        this.elements.svg  = d3.select(container)
            .append('svg')
            .attr('class', mainClass);

        //GROUP 
        const transformX = width/2 - margins.left;
        const transformY = height/2 - margins.top;
        const classNameGroup = `${mainClass}__container`;
        this.elements.pieContainer = this.elements.svg
            .append('g')
                .attr('class', classNameGroup)
                .attr('transform', `translate(${transformX}, ${transformY})`);
    }

    repositionPieContainer(){
        const { dimension: { width, height, margins }  } = this.settings;
        const transformX = width/2 - margins.left;
        const transformY = height/2 - margins.top;

        this.elements.pieContainer
            .attr('transform', `translate(${transformX}, ${transformY})`);
    }

    //DATA CALCULATION
    calcPieData(){
        const data  = this.data.rawData;
        const pieGenerator = d3.pie().value((d)=> d.value);
        this.data.pieData = pieGenerator(d3.entries(data));
    }

    createArcGenerator(smallScreen){
        const { dimension: { width, height, margins } } = this.settings;
        const innerRadius = smallScreen === false ? 90 : 75;

        const outerRadius = Math.min(width, height) / 2 - margins.pieMargin;

        this.settings.arcGenerator = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
    }

    //PIE/DONUT  ------------------------------------------------------------------------------------
    drawPie(){
        const { data:{ pieData }, elements: { pieContainer }, settings: { mainClass, arcGenerator} } = this;
        const slicesClass = `${mainClass}__slices ${mainClass}__slices--`;
        const groupClass = `${mainClass}__slicesGroup ${mainClass}__slicesGroup--`;

        const arcTween = function(a){
            const i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
              return arcGenerator(i(t));
            };
        }

        pieContainer.selectAll(`.${mainClass}__slices`).data(pieData)
            .join(
                (enter) => enter
                    .append('g')
                    .attr('class', (d,i)=> `${groupClass}${i}`)
                    .append('path')
                    .attr('class', (d,i)=> `${slicesClass}${d.data.key}`)
                    .attr('d', arcGenerator)
                    .style("stroke", "white")
                    .each(function(d){ this._current = d;})
                    .attr('stroke-width', (d) => this.opacityValue(d.data.value)),
                (update) => update
                    .transition().duration(500).attrTween('d', arcTween)
                    .attr('stroke-width', (d) => this.opacityValue(d.data.value)),
        
            );
    }

    addLabels(){
        const { elements:{ pieContainer}, settings: { mainClass, arcGenerator }} = this;

        const className = `${mainClass}__labels ${mainClass}__labels--`;

        pieContainer.selectAll(`.${mainClass}__slicesGroup`)
            .append('text')
            .attr('class', (d,i) => `${className}${i} ${d.data.key}`)
            .text((d) => this.changeName(d.data.key))
            .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
            .style('opacity', (d) => this.opacityValue(d.data.value))
            .each(function(d){ this._current = d;});
    }

    updateLabels(){
        const { data: { pieData }, elements: { pieContainer }, settings: { mainClass, arcGenerator }} = this;  

        const labels = pieContainer.selectAll(`.${mainClass}__labels`).data(pieData)
        
        function labelarcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
              return "translate(" + arcGenerator.centroid(i(t)) + ")";
            };
        }

          labels.transition().duration(500)
            .style('opacity', (d) => this.opacityValue(d.data.value))
            .attrTween("transform", labelarcTween);
    }

    addNumbersLabels(){
        const { elements: { pieContainer }, settings: { mainClass } } = this;
        const className = `${mainClass}__numLabels ${mainClass}__numLabels--`;

        pieContainer.selectAll(`.${mainClass}__slicesGroup`)
            .append('text')
            .attr('class', (d,i) => `${className}${i}`)
            .text((d) => `${d.data.value} szt.`)
            .attr("transform", (d) => this.calcTransform(d));
    };

    updateNumberLabels(){
        const { data:{ pieData }, elements: { pieContainer }, settings:{ mainClass, arcGenerator } } = this;
        const numberLabels = pieContainer.selectAll(`.${mainClass}__numLabels`).data(pieData)

        function labelarcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
                return `translate(${arcGenerator.centroid(i(t))[0]}, ${arcGenerator.centroid(i(t))[1]+25})`; 
            };
        }

        numberLabels.transition().duration(500)
            .text((d) => `${d.data.value} szt.`)
            .style('opacity', (d) => this.opacityValue(d.data.value))
            .attrTween("transform", labelarcTween);
    }

    addMainNumber(){
        const { data: { rawData }, elements:{ pieContainer }, settings: { mainClass} } = this;

        let sum = 0;
        for(const key in rawData){sum = sum + rawData[key];};

        const classNameDesc = `${mainClass}__centerText ${mainClass}__centerText--small centerTextDesc`;
        const classNameNumber = `${mainClass}__centerText ${mainClass}__centerText--big centerTextNumber`;

        const centerTextgroup = pieContainer.append('g')

        const centerTextDesc = centerTextgroup
            .append('text')
            .attr('class', classNameDesc)
            .text('Ilość butów:')
            .style('transform','translate(0,-20px)')

        const centerTextNumber = centerTextgroup
            .append('text')
            .attr('class', classNameNumber)
            .text(sum)
            .style('transform','translate(0, 20px)');

    }

    updateMainNumber(){
        const { data: { rawData }, elements:{ pieContainer }, settings: { mainClass} } = this;

        let sum = 0;
        for(const key in rawData){sum = sum + rawData[key];};

        const centerTextNumber = pieContainer.selectAll(`.${mainClass}__centerText--big`);

        centerTextNumber
        .transition().duration(200)
        .style('opacity', 0)
        .transition()
        .style('opacity', 1)
        .text(sum)
    }
 
    //ADDITIONAL -----------------------------------------------------------------------------------
    changeName(name){
        switch(name){
            case 'F':
                return 'Damskie'
                break;
            case 'M':
                return 'Męskie'
                break;
        }
    };
    
    calcTransform(d){
        const { arcGenerator } = this.settings;
        const transX = arcGenerator.centroid(d)[0] 
        const transY = arcGenerator.centroid(d)[1] + 25
        return `translate(${transX}, ${transY})`
    };

    opacityValue(value){
        if(value === 0){
            return 0;
        }else{
            return 1;
        };
    }

    //INTERACTIVITY -----------------------------------------------------------------------------------
    addHoverEffect(smallScreen){
        const { elements: { pieContainer }, settings:{ mainClass, arcGenerator } } = this;
        const slicesGroup = pieContainer.selectAll(`.${mainClass}__slicesGroup`);

        if(!smallScreen){
            //d3 controlls DOM and overwrite css it is neccesery to add style in case user change screen size. Without this line resizinz does not work propery.
            //Same thing below in else.
            pieContainer.selectAll(`.${mainClass}__numLabels`).style('opacity', 0); 

            slicesGroup.on('mouseover', (d,i)=>{

                pieContainer.selectAll(`.${mainClass}__slices--${d.data.key}`)
                .style('opacity', 1)
                .style('transform', 'scale(1.05)')
     
                const currentLabelTranslate = pieContainer.selectAll(`.${mainClass}__labels--${i}`).attr('transform')
                pieContainer.selectAll(`.${mainClass}__labels--${i}`)
                    .transition().duration(300)
                    .attr("transform", `${currentLabelTranslate} scale(1.3)`);

                pieContainer.selectAll(`.${mainClass}__numLabels--${i}`)
                    .transition().delay(200).duration(300)
                    .style('opacity', 1);
            });
            slicesGroup.on('mouseout', (d,i)=>{
                pieContainer.selectAll(`.${mainClass}__slices--${d.data.key}`)
                    .style('opacity', .5)
                    .style('transform','scale(1)')

                pieContainer.selectAll(`.${mainClass}__labels--${i}`)
                    .transition().duration(300)
                    .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)

                pieContainer.selectAll(`.${mainClass}__numLabels--${i}`)
                    .transition().delay(200).duration(300)
                    .style('opacity', 0)
            });
        }else{
            pieContainer.selectAll(`.${mainClass}__numLabels`).style('opacity', 1);

            slicesGroup.on('mouseover', (d,i,nodes)=>{});
            slicesGroup.on('mouseout', (d,i,nodes)=>{});

        }
    }
}