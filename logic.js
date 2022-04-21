/*************************
 * 
 *  size logic
 * 
*************************/

let bodySize = d3.select('body').node().getBoundingClientRect();
let infoSize = d3.select('.info').node().getBoundingClientRect()

d3.select('#title-subheader').style('top',d3.select('.title-flag').node().getBoundingClientRect().bottom + 20)
d3.select('#title-description-container').style("width", Math.floor(d3.select('body').node().clientWidth - d3.select('.title-flag').node().getBoundingClientRect().right))

/***************************************
****************************************

    D3 Code for Bar Chart
    Keep the bar chart under the  map

****************************************
***************************************/

let homes = [
    {state: "PA", count: 5, color: 'blue'},
    {state: "CT", count: 3, color: '#7C878E'},
    {state: "VA", count: 6, color: '#630031'},
    {state: "TN", count: 1, color: '#ff8200'}
]

let y = d3.scaleLinear()
        .domain([0, 6])
        .range([250, 50])

let x = d3.scaleBand()
        .domain(homes.map(x => x.state))
        .range([175, 475])
        .paddingInner(.2)

let axisLeft = d3.axisLeft(y)
    .tickValues([0, 3, 6])
    .tickFormat(d3.format(".0"))

// d3.select("#usa-map")
//     .append("g")
//     .attr('id', 'backgroundRect')
//     .append('rect')
//     .attr('x', 0)
//     .attr('y', 0)
//     .attr('width', 600)
//     .attr('height', 300)
//     .attr('fill', 'white')

d3.select('#usa-map')
    .append('g')
        .attr('id', 'barG')
    .selectAll(".homeBar")
    .data(homes)
    .enter().append('rect')
    .attr('y', d => y(d.count))
    .attr('x', d => x(d.state))
    .attr('height', d => y(0) - y(d.count))
    .attr('width', d => x.bandwidth())
    .attr('fill', d => d.color)
    .attr('fill-opacity', .5)
    .attr('stroke', 'black')

d3.select("#barG")
    .append('rect')
    .attr('id', 'coverBar')
    .attr('x', x.range()[0]-1)
    .attr('y', y.range()[1] - 1)
    .attr('width', x.range()[1] - x.range()[0] + 2)
    .attr('height', y.range()[0] - y.range()[1] + 2)
    .attr('fill', 'white')
    // .attr('transform', 'matrix(1,0,0,1,0,0)')

d3.select('#barG')
    .append('g')
    .attr('id', 'countAxis')
    .attr('transform', 'translate(150, 0)')
    .attr('opacity', 0)
    .call(axisLeft)


/**********************
***********************
    D3 Code for Map
***********************
***********************/
const projection = d3.geoMercator()
    .scale([450])
    .center([-97.922211, 38.381266])
    .translate([300, 150])

const pathGenerator = d3.geoPath(projection)

d3.select('#usa-map')
    .append('g')
        .attr("id", "mapG")
    .selectAll('.statePath')
    .data(usa.features)
    .join('path')
        .attr('fill', (d,i) => d.properties.name == "Pennsylvania" ? "blue" : "white")
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr("id", (d, i) => `state_${d.properties.name.replace(/\s+/g, '').toLowerCase()}`)
        .attr("class", (d,i) => {
            let txt = ['statePath']
            if(d.properties.name != "Pennsylvania") {txt.push( "NotPA")};

            ['Pennsylvania', "Connecticut", "Tennessee", "Virginia"].indexOf(d.properties.name) < 0 ? txt.push("NotHome") : txt.push('Home');

            return(txt.join(" "))
        })
        .attr('d', pathGenerator)
        .attr("transform", 'translate(0 0)')
        .style("transform-box", "fill-box")
        .style('transform-origin',  'center')
        .attr('title', d => d.properties.name)

d3.selectAll(".NotPA").attr('opacity', 0)
d3.selectAll('.Home').raise();

/****************************
 * *************************
 * 
 * Logic for state transforms
 * 
 * **************************
 ***************************/

let tn = d3.select('#state_tennessee').node().getBBox();
let me = d3.select('#state_maine').node().getBBox();

let ne_viewBox = `${Math.floor(tn.x)} ${Math.floor(me.y)} ${Math.ceil(me.width + me.x - tn.x)} ${Math.ceil(tn.height + tn.y - me.y + 2)}` 

let paBB = d3.select('#state_pennsylvania').node().getBBox()
let ctBB = d3.select("#state_connecticut").node().getBBox()

let stateTransforms = [{id: "#state_pennsylvania", to: [x('PA') + x.bandwidth()/2, y(6)]}, {id: "#state_connecticut", to: [x('CT') + x.bandwidth()/2, y(6)]}, {id: "#state_virginia", to: [x('VA') + x.bandwidth()/2, y(6)]}, {id: "#state_tennessee", to: [x('TN') + x.bandwidth()/2, y(6)]}].map(function(x){
    let tmp = d3.select(x.id).node().getBBox()
    return({
        id: x.id, 
        transform: `translate(${x.to[0] - tmp.x - tmp.width/2} ${x.to[1] - tmp.height/2 - tmp.y})`,
        transform2: `translate(${x.to[0] - tmp.x - tmp.width/2} ${x.to[1] - tmp.height/2 - tmp.y + 200})`,
        transform3: `translate(${x.to[0] - tmp.x - tmp.width/2} ${x.to[1] - tmp.height/2 - tmp.y + 225})`
    })
})

d3.select('#usa-map').attr("viewBox", `${Math.floor(paBB.x) - 1} ${Math.floor(paBB.y) -1} ${Math.ceil(paBB.width) + 2} ${Math.ceil(paBB.height) + 2}`)

/*********************
 * *******************
 * 
 * Animation logic
 * 
 * *******************
**********************/

let headerWidths = [".title-flag", "#title-subheader"].map(x => {
    return(d3.select(x).node().clientWidth)
})

let tl_leave_title = gsap.timeline({
    scrollTrigger: {
        trigger: "#postTitle",
        // markers: true,
        start: "top bottom",
        end: "bottom center",
        scrub: true
    }
})
.add('start')
.to('.title-flag', {duration: 1.5, x: -headerWidths[0]}, 'start')
.to('#title-subheader', {duration: 1.5, x: -headerWidths[1]}, 'start')
.to("#youShouldScroll", {duration: 1.5, opacity: 0}, 'start')
.to("#title-description > p:nth-child(1)", {duration: 2, opacity: 0}, 'start')
.to("#title-description > p:nth-child(2)", {duration: 4, opacity: 0}, 'start')
// .from('#usa-map', {duration: 2, width: 25}, 'start')

let t_section1_txt = gsap.timeline({
    scrollTrigger: {
        trigger: "#section1",
        start: "top 70%",
        end: "top: 10%",
        scrub: true
    }
})
.from("#section1 > .info > p", {duration: 2, opacity: 0})

let t_section1_post = gsap.timeline({
    scrollTrigger: {
        trigger: "#post1",
        start: "top: bottom",
        end: "bottom bottom",
        scrub: true
    }
})
.to("#section1 > .info > p", {duration: 4, opacity: 0,
    // transform: `translateX(${Math.ceil(bodySize.width - infoSize.right + infoSize.width)}px)`
})

let t_section1_svg = gsap.timeline({
    scrollTrigger: {
        trigger: '#section1',
        // markers: true,
        start: "top top",
        end: "top -900%",
        pin: '#usa-map',
        scrub: true
    }
})

let t_section2 = gsap.timeline({
    scrollTrigger: {
        trigger: "#section2",
        start: "top bottom",
        end:"top top",
        scrub: true
    }
})

.add('start')
.to("#usa-map", {duration: 3, attr: {viewBox: ne_viewBox}}, 'start')
.from("#section2 > .info > p:nth-child(1)", {duration: 5, opacity: 0}, 'start')
.from("#section2 > .info > p:nth-child(2)", {duration: 10, opacity: 0}, 'start')
.from("#section2 > .info > p:nth-child(3)", {duration: 15, opacity: 0}, 'start')
.to('.NotPA', {duration: 3, opacity: 1}, 'start')
.add('emphasis')
.to("#state_connecticut", {duration: 1, fill: "#7C878E"}, 'emphasis')
.fromTo('#state_connecticut', {duration: 1, attr: {transform: "scale(1)"}}, {duration: 1, attr: {transform: "scale(2)"}}, 'emphasis')
.to('#state_connecticut', {attr: {transform: 'scale(1)'}})

let t_section2_post = gsap.timeline({
    scrollTrigger: {
        trigger: "#post2",
        start: "top: bottom",
        end: "bottom top",
        scrub: true
    }
})
.add('start')
.to("#section2 > .info > p:nth-child(1)", {duration: 5, 
    // transform: `translateX(${Math.ceil(bodySize.width - infoSize.right + infoSize.width)}px)`, 
    opacity: 0}, 'start')
.to("#section2 > .info > p:nth-child(2)", {duration: 10, 
    // transform: `translateX(${Math.ceil(bodySize.width - infoSize.right + infoSize.width)}px)`, 
    opacity: 0}, 'start')
.to("#section2 > .info > p:nth-child(3)", {duration: 15, 
    // transform: `translateX(${Math.ceil(bodySize.width - infoSize.right + infoSize.width)}px)`, 
opacity: 0}, 'start')

let t_section3 = gsap.timeline({
        scrollTrigger: {
            trigger: "#section3",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            // markers: true
        }
    })
    .add('va')
    .from("#section3 > .info > p:nth-child(1)", {duration: 2, opacity: 0}, 'va')
    .add('tn')
    .from("#section3 > .info > p:nth-child(2)", {duration: 2, opacity: 0}, 'tn')
    .to("#state_virginia", {fill: "#630031"}, "va")
    .to("#state_tennessee", { fill: "#FF8200"}, "tn")

let t_section3_post = gsap.timeline({
    scrollTrigger: {
        trigger: "#post3",
        start: "top top",
        end: "bottom center",
        scrub: true,
        // markers: true
    }
})
.add('start')
.to("#section3 > .info > p:nth-child(1)", {duration: 3, opacity: 0}, 'start')
.to("#section3 > .info > p:nth-child(2)", {duration: 6, opacity: 0}, 'start')


let t_section_4 = gsap.timeline({
    scrollTrigger: {
        trigger: "#section4",
        start: "start 75%",
        end: "center center",
        scrub: true
    },
    onComplete: function(){
        d3.selectAll('.NotHome').style('pointer-events', 'none')
    },
    onReverseComplete: function(){
        d3.selectAll('.NotHome').style('pointer-events', 'auto')
    }
})
.add('start')
.to(".NotHome", {duration: 2, opacity: 0}, 'start')
.to(stateTransforms[0].id, {duration: 2, attr: {transform: stateTransforms[0].transform}}, 'start')
.to(stateTransforms[1].id, {duration: 2, attr: {transform: stateTransforms[1].transform}}, 'start')
.to(stateTransforms[2].id, {duration: 2, attr: {transform: stateTransforms[2].transform}}, 'start')
.to(stateTransforms[3].id, {duration: 2, attr: {transform: stateTransforms[3].transform}}, 'start')
.to("#usa-map", {duration: 1.5, attr: {viewBox: "0 0 600 300"}}, 'start')
.from("#section4 > .info > p:nth-child(1)", {duration: 3, opacity: 0}, 'start')

let t_section4_post = gsap.timeline({
    scrollTrigger: {
        trigger: "#post4",
        start: "center center",
        end: "center top",
        scrub: true,
        // markers: true
    }
})
.to("#section4 > .info > p", {duration: 3, opacity: 0})

let t6 = gsap.timeline({
    scrollTrigger: {
        trigger: "#section5",
        start: "start 70%",
        end: "center 10%",
        scrub: true
    }
})
.add('start')
.to("#coverBar", {duration: 5, attr: {y: 250}}, 'start')
// .to('.Home', {duration: 5, attr: {transform: "translate(0, 250)"}})
.to(stateTransforms[0].id, {duration: 5, attr: {transform: stateTransforms[0].transform2}}, 'start')
.to(stateTransforms[1].id, {duration: 5, attr: {transform: stateTransforms[1].transform2}}, 'start')
.to(stateTransforms[2].id, {duration: 5, attr: {transform: stateTransforms[2].transform2}}, 'start')
.to(stateTransforms[3].id, {duration: 5, attr: {transform: stateTransforms[3].transform2}}, 'start')
.to("#countAxis", {duration: 5, opacity: 1}, 'start')
.add('finish')
.to(stateTransforms[0].id, {duration: 1, attr: {transform: stateTransforms[0].transform3}}, 'finish')
.to(stateTransforms[1].id, {duration: 1, attr: {transform: stateTransforms[1].transform3}}, 'finish')
.to(stateTransforms[2].id, {duration: 1, attr: {transform: stateTransforms[2].transform3}}, 'finish')
.to(stateTransforms[3].id, {duration: 1, attr: {transform: stateTransforms[3].transform3}}, 'finish')
.from("#section6 > .info > p:nth-child(1)", {duration: 3, opacity: 0}, 'finish')
