////////////////////////////////
//// auto screen reoload  /////
///////////////////////////////
var windowWidth = $(window).width();
var windowHeight = $(window).height();
$(window).resize(function() {
    if (windowWidth != $(window).width() || windowHeight != $(window).height()) {
        location.reload();
        return;
    }
});


var selectedData = "data2018";

/*Dropdown Menu*/
$('.dropdown').click(function() {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);
});
$('.dropdown').focusout(function() {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
});
$('.dropdown .dropdown-menu li').click(function() {
    $(this).parents('.dropdown').find('span').text($(this).text());
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
});
/*End Dropdown Menu*/


$('.dropdown-menu li').click(function(e) {
    var input = $(e.target).text();
    //console.log(input);
    selectedData = "data" + input;
    $("#currentYear").html(input);
    //console.log(selectedData);
});

//////////////////////////////////////////////////////////////////////////
//// Set width & height across devices: mobile, small, medium, full /////
/////////////////////////////////////////////////////////////////////////
var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var mobile = false;
var fullWidth = false;
var mediumWidth = false;
var smallWidth = false;

if (viewportWidth > 900) {
    fullWidth = true;
}

if (viewportWidth <= 900 && viewportWidth > 600) {
    mediumWidth = true;
}

if (viewportWidth <= 600) {
    smallWidth = true;
}

if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    mobile = true;
}

// set the dimensions and margins of the graph
var margin = {
    top: 10,
    right: 120,
    bottom: 20,
    left: 100
};


var width = (viewportWidth - 300) - margin.left - margin.right;
var heightInitial = 750;
var height = heightInitial - margin.top - margin.bottom;

if (mobile) {
    heightInitial = viewportHeight - 175 - margin.left - margin.right;
}

if (smallWidth || mobile) {
    height = 400;
    width = 550 - margin.left - margin.right;
}

if (mediumWidth) {
    imageWidth = 96;
    imageHeight = 33;
    width = 450;
}

if (viewportWidth > 1200) {
    width = 1200 - 300 - margin.left - margin.right
}

// chart 2

var width2 = $('#chart2').parent().width();
var height2 = width2 * 2 / 3;

////////////////////////////
//// GLOBAL VARIANLES  ////
///////////////////////////


//tooltip
var tooltip = floatingTooltip('gates_tooltip', 240);

// center of svg
var center = {
    x: (width + margin.left + margin.right) / 2,
    y: (height + margin.top + margin.bottom) / 2
};

/////////////////////
//// Set scales  ////
/////////////////////


var radiusScale = d3.scaleSqrt()
    .domain([0, 128086])
    .range([5, 25])

var xScale = d3.scaleLinear()
    .rangeRound([0, width]);

var xAxis = d3.axisBottom(xScale)
    .ticks(10, ".0s")
    .tickSizeOuter(0);

var xScale1 = d3.scaleLinear().range([margin.left, width - margin.right]);
var xScale2 = d3.scaleLinear().range([margin.left, width - margin.right]);


//Scales chart 2
var x2 = d3.scaleLinear().domain([2009, 2018]).range([0, width2]),
    y2 = d3.scaleLinear().domain([1, 200000]).range([height2, 0]),
    xAxis2 = d3.axisBottom(x2).ticks(10).tickFormat(d3.format("d")).tickSize(0),
    yAxis2 = d3.axisLeft(y2).ticks(10).tickSize(0);



////////////////////////////////
//// initialize SVG and g  /////
///////////////////////////////

var svg = d3.select("#graph")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", function(d) {
        return mobile || smallWidth ? "400px" : ""
    })
    .style("margin-top", function(d) {
        return mobile || smallWidth ? "100px" : ""
    })
    .style("margin-left", function(d) {
        return mobile || smallWidth ? "0px" : ""
    })
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom).attr("class", "svg")

var g = svg.append("g").attr("class", "frame")
    .attr("transform", function(d) {
        if (mediumWidth) {
            return "translate(0,10)"
        } else if (mobile || smallWidth) {
            return "translate(-100,10)"
        } else {
            return "translate(" + margin.left + "," + margin.top + ")"
        }
    });

var svg2 = d3.select("#chart2").append("svg")
    .attr("width", width2 + margin.left + margin.right)
    .attr("height", height2 + margin.top + margin.bottom);
var g2 = svg2.append("g").attr("class", "wrapper").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg3 = d3.select("#chart3").append("svg")
    .attr("width", width2 + margin.left + margin.right)
    .attr("height", height2 + margin.top + margin.bottom);
var g3 = svg3.append("g").attr("class", "wrapper2").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var legend = svg2.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(110,0)");

var legend2 = svg3.append("g")
    .attr("class", "legend2")
    .attr("transform", "translate(110,0)");

var xAxisG = g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (height - 200) + ")")


data.nodes.forEach(function(d) {
    d.data2009 = +d.data2009;
    d.data2010 = +d.data2010;
    d.data2011 = +d.data2011;
    d.data2012 = +d.data2012;
    d.data2013 = +d.data2013;
    d.data2014 = +d.data2014;
    d.data2015 = +d.data2015;
    d.data2016 = +d.data2016;
    d.data2017 = +d.data2017;
    d.data2018 = +d.data2018;
    d.GDP = Math.round(+d.GDP);
})

var GDPextent = d3.extent(data.nodes, d => d.GDP)

/*
 * Start d3 force simulation
 */
var simulation = d3.forceSimulation();

simulation
    .force("link", d3.forceLink().id(function(d) {
        return d.id;
    }).strength(0.3))
    .force('x', d3.forceX(function(d) {
        return width / 2
    }).strength(0.03))
    .force('y', d3.forceY(function(d) {
        return height / 2
    }).strength((0.03)))
    .force('collide', d3.forceCollide(function(d) {
        return radiusScale(+d[selectedData])
    })).velocityDecay(0.1).alphaDecay(0.05);

var circles = g.selectAll(".bubble")
    .data(data.nodes)
    .enter().append("circle")
    .attr("class", "bubble")
    .attr("r", 0)
    .attr("fill", function(d) {
        return d.status == 'Enter' ? '#00B78C' : '#EC7E6B';
    })
    .attr('stroke', '')
    .on('mouseover', showDetail)
    .on('mouseout', hideDetail);

var links = g.selectAll(".link")



simulation.nodes(data.nodes)
    .on('tick', changeNetwork);

function changeNetwork() {
    d3.selectAll('.bubble')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

}

var dataExitSorted;
var dataEnterSorted;

var exitPositions = [];
var enterPositions = [];


var triggerAmount = .5;
var forceStrength = 0.03;

function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
}

/*
 * Scrollmagic
 */
var pushFollowersValue = false;

//initilize scrollmagic
var controller = new ScrollMagic.Controller();

var duration = Math.max(1, d3.select("#container").node().offsetHeight - viewportHeight / 2);

var pinBubbleChart = new ScrollMagic.Scene({
        triggerElement: "#container",
        triggerHook: 0,
        offset: -25,
        duration: duration
    })
    .setPin("#graph", {
        pushFollowers: true
    })
    .on('enter', function() {

        // circles appear
        circles.transition()
            .duration(250)
            .attr('r', function(d) {
                return radiusScale(+d[selectedData])
            });
    })
    .addTo(controller);


var firstTrigger = new ScrollMagic.Scene({
        triggerElement: "#allcountries",
        triggerHook: triggerAmount,
        offset: 100,
        duration: 300
    })
    .addTo(controller)
    .on("enter", function(e) {

        d3.selectAll(".link").attr("opacity", 0);

        simulation.force('x', d3.forceX().strength(0.06).x(center.x))
            .force('y', d3.forceY(function(d) {
                return height / 2
            }).strength((0.06)));

        simulation.alpha(0.3).restart();
        circlesTransition();

        d3.selectAll("#allcountries").classed("highlighted", true)

    })
    .on("leave", function(e) {
        d3.selectAll(".highlighted").classed("highlighted", false)

    });

var secondTrigger = new ScrollMagic.Scene({
        triggerElement: "#divided",
        triggerHook: triggerAmount,
        offset: 100,
        duration: 300
    })
    .addTo(controller)
    .on("enter", function(e) {
        if (e.target.controller().info("scrollDirection") == "REVERSE") {
            drawCircles(data.nodes);
            simulation.nodes(data.nodes)
                .on('tick', changeNetwork);
        }

        d3.selectAll(".link").attr("opacity", 0);

        d3.select(".axis").attr("opacity", 0);

        simulation.force('x', d3.forceX(function(d) {
                var i;
                if (d.status == 'Enter') {
                    i = 0
                } else {
                    i = 1
                }
                return xposition(i)
            }).strength(0.06))
            .force('y', d3.forceY(function(d) {
                return height / 2;
            }).strength((0.06)))
            .force('collide', d3.forceCollide(function(d) {
                return radiusScale(+d[selectedData])
            })).alphaDecay(0.01);
        simulation.alpha(0.7).restart();
        circlesTransition();

        d3.selectAll("#divided").classed("highlighted", true)
    })
    .on("leave", function(e) {
        d3.selectAll(".highlighted").classed("highlighted", false);
    });


var thirdTrigger = new ScrollMagic.Scene({
        triggerElement: "#gdp",
        triggerHook: triggerAmount,
        offset: 100,
        duration: 400
    })
    .addTo(controller)
    .on("enter", function(e) {

        d3.select(".axis").attr("opacity", 1);
        d3.selectAll(".link").attr("opacity", 0);

        xScale.domain(GDPextent);
        xAxis.ticks(10, ".0s")
            .tickSizeOuter(0)
            .tickFormat(function(d) {
                return "$" + d;
            });
        xAxisG.call(xAxis);

        var newData = data.nodes.filter(function(d) {
            return d.country != "Liquefied Natural Gas" && d.country != 'Isle of Man'
        })

        drawCircles(newData);
        //console.log(newData)
        simulation.nodes(newData)
            .on('tick', changeNetwork);

        if (e.target.controller().info("scrollDirection") == "REVERSE") {

            simulation.stop();

            simulation = d3.forceSimulation(data.nodes);
            simulation
                .force("x", d3.forceX(function(d) {
                    return xScale(d.GDP);
                }).strength(0.9))
                .force("y", d3.forceY(height / 2).strength(0.09))
                .force('collide', d3.forceCollide(function(d) {
                    return radiusScale(+d[selectedData])
                }))
                .alphaDecay(0.07) // change this to change how clumped the circles are
                .on('tick', changeNetwork);

        } else {

            simulation.force("x", d3.forceX(function(d) {
                    return xScale(d.GDP);
                }).strength(1))
                .force("y", d3.forceY(height / 2).strength(0.5))
                .alphaDecay(0.05)
                .on('tick', changeNetwork);

            simulation.alpha(0.4).restart();
        }


        d3.selectAll("#gdp").classed("highlighted", true)

    })
    .on("leave", function(e) {
        d3.selectAll(".highlighted").classed("highlighted", false)
    });


var fourth = new ScrollMagic.Scene({
        triggerElement: "#radial",
        triggerHook: triggerAmount,
        offset: 100,
        duration: 400
    })
    .addTo(controller)
    .on("enter", function(e) {


        d3.select(".axis").attr("opacity", 0);


        var dataExit = data.nodes.filter(function(d) {
            return d.status == 'Exit'
        });

        var dataEnter = data.nodes.filter(function(d) {
            return d.status == 'Enter'
        });

        // Update and restart the simulation.


        //outer
        var newData = drawRadius(dataExit.length, 200, dataExit);
        var newData2 = drawRadius(dataEnter.length, 300, dataEnter);
        var newData3 = newData.concat(newData2);

        //console.log(newData2)
        drawCircles(newData3);

        var allLinkPos = enterPositions.concat(exitPositions);

        //console.log(allLinkPos)

        var linksData = data.links;

        for (var i = 0; i < linksData.length; i++) {
            for (var j = 0; j < allLinkPos.length; j++) {
                if (linksData[i].source == allLinkPos[j].id) {
                    linksData[i].sourcex = allLinkPos[j].x1;
                    linksData[i].sourcey = allLinkPos[j].y1;
                }
                if (linksData[i].target == allLinkPos[j].id) {
                    linksData[i].targetx = allLinkPos[j].x1;
                    linksData[i].targety = allLinkPos[j].y1;
                }
            }
        }

        //console.log(linksData)

        linksData.forEach(function(d) {
            d.id = d.source + "_" + d.target;
        })


        links
            .data(linksData)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke", "#ddd")
            .transition().duration(250)
            .attr("opacity", 0.8)
            .attr("stroke-opacity", 0.8)
            // .attr("id")
            .attr("x1", function(d) {
                return d.sourcex
            })
            .attr("y1", function(d) {
                return d.sourcey
            })
            .attr("x2", function(d) {
                return d.targetx
            })
            .attr("y2", function(d) {
                return d.targety
            })



        simulation = d3.forceSimulation(newData3);
        simulation
            .force('x', d3.forceX(function(d) {
                return d.x1
            }).strength(0.1))
            .force('y', d3.forceY(function(d) {
                return d.y1
            }).strength((0.1)))
            .alphaDecay(0.03) //the higher the alpha decay rate the faster the simualtion stablizes, but if too high then the circles won't reach their destination
            .force("collide", d3.forceCollide(7)) // change this to change how clumped the circles are, 7 or 8
            .on('tick', changeNetwork);

        simulation.alpha(5).restart();

        d3.selectAll(".bubble").raise();

        d3.selectAll(".bubble")
            .on('mouseover', function(d) {

                d3.selectAll(".link").attr("stroke", "#ddd");

                d3.selectAll(".link")
                    .filter(function(k) {
                        return k.source === d.id;
                    }).attr("stroke", "black");

                d3.selectAll(".link")
                    .filter(function(k) {
                        return k.target === d.id;
                    }).attr("stroke", "black");

                var texture = textures
                    .lines()
                    .size(4)
                    .strokeWidth(1)
                    .stroke(function() {
                        return d.status == 'Enter' ? '#00B78C' : '#EC7E6B';
                    });

                svg.call(texture);
                d3.select(this).attr('fill', texture.url());


                var content = '<span class="title"><b>' + d.country + '</b></span><br/>' +
                    '<span><b>Flow Direction: </b>' + d.status + '</span><br/>' +
                    '<span><b>Amount: </b>' + d[selectedData] + ' (million cubic meters)';

                d3.selectAll('.tooltip').style('background-image', '-webkit-linear-gradient(top,' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ', ' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ' 40%, transparent 40%, transparent 100%)');
                d3.selectAll('.tooltip').style('background-image', 'linear-gradient(top,' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ', ' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ' 40%, transparent 40%, transparent 100%)');
                tooltip.showTooltip(content, d3.event);

            })
            .on('mouseout', function(d) {
                d3.selectAll(".link").attr("stroke", "#ddd");

                d3.select(this)
                    .attr('fill', function(d) {
                        return d.status == 'Enter' ? '#00B78C' : '#EC7E6B';
                    });

                tooltip.hideTooltip();
            });

        d3.selectAll("#radial").classed("highlighted", true)


    })
    .on("leave", function(e) {
        d3.selectAll(".highlighted").classed("highlighted", false)
    });

var fifth = new ScrollMagic.Scene({
        triggerElement: "#sort",
        triggerHook: triggerAmount,
        offset: 100,
        duration: 400
    })
    .addTo(controller)
    .on("enter", function(e) {


        d3.selectAll(".link").attr("opacity", 0);

        if (e.target.controller().info("scrollDirection") == "REVERSE") {


        } else {


            var dataExit = data.nodes.filter(function(d) {
                return d.status == 'Exit'
            });

            var dataEnter = data.nodes.filter(function(d) {
                return d.status == 'Enter'
            });

            dataExitSorted = dataExit.slice().sort((a, b) => d3.ascending(a[selectedData], b[selectedData]))
            dataEnterSorted = dataEnter.slice().sort((a, b) => d3.ascending(a[selectedData], b[selectedData]))

            dataExitSorted.forEach(function(d, i) {
                d.exit = i;
            })

            dataEnterSorted.forEach(function(d, i) {
                d.enter = i;
            })
            console.log(dataExitSorted);
            console.log(dataEnterSorted);

            chart2(); // call here since it needs the above arrays to be populated
            chart3();
            var sortedAll = dataExitSorted.concat(dataEnterSorted);

            var indexExit = [...Array(dataExitSorted.length).keys()]; //[0,1,2...34]
            var indexEnter = [...Array(dataEnterSorted.length).keys()]; //[0,1,2...34]

            xScale1.domain([0, 33]);
            xScale2.domain([0, 37]);


            sortedAll.forEach(function(d) {
                if (d.status == 'Exit') {
                    d.x = xScale1(d.exit);
                    d.y = height / 3;
                } else {
                    d.x = xScale2(d.enter);
                    d.y = 2 * height / 3;
                }
            })

            drawCircles(sortedAll);

            simulation = d3.forceSimulation(sortedAll);
            simulation.force('x', d3.forceX(function(d) {
                    if (d.status == 'Exit') {
                        return xScale1(d.exit)
                    } else {
                        return xScale2(d.enter)
                    }
                }).strength(1.5))
                .force('y', d3.forceY(function(d) {
                    if (d.status == 'Exit') {
                        return height / 3
                    } else {
                        return height * 2 / 3
                    }
                }).strength(3))
                .force("collide", d3.forceCollide(function(d) {
                    return radiusScale(+d[selectedData])
                }))
                .alphaDecay(0.027)
                .on('tick', changeNetwork);

            simulation.alpha(0.8).restart();
            //simulation.stop()

        }

        d3.selectAll("#sort").classed("highlighted", true)


    })
    .on("leave", function(e) {
        d3.selectAll(".highlighted").classed("highlighted", false)
    });



function drawRadius(numNodes, radius, dataN) {
    for (var i = 0; i < dataN.length; i++) {
        //console.log(dataN[i].id);

        var angle = (i / (numNodes / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
        // For a semicircle, we would use (i / numNodes) * Math.PI.
        var x = (radius * Math.cos(angle)) + (width / 2); // Calculate the x position of the element.
        var y = (radius * Math.sin(angle)) + (width / 2); // Calculate the y position of the element.

        dataN[i]['x1'] = x;
        dataN[i]['y1'] = y;

        var thisID = dataN[i].id
        var obj = {};
        obj['id'] = thisID;
        obj['x1'] = x;
        obj['y1'] = y;

        if (dataN[i].status == 'Exit') {
            exitPositions.push(obj);
        } else {
            enterPositions.push(obj);
        }
    }

    return dataN;
}




function circlesBindData(data) {
    circles = g.selectAll(".bubble").data(data);
}

function circlesExit() {
    circles.exit().transition().duration(750)
        .attr("r", 0)
        .remove();
}

function circlesTransition() {
    circles.transition().duration(750)
        .attr("r", function(d) {
            return radiusScale(+d[selectedData]);
        })
        .attr('fill', function(d) {
            return d.status === 'Enter' ? '#00B78C' : '#EC7E6B';
        })
}



function circlesEnter() {
    circles.enter().append("circle").attr("class", "bubble")
        .attr("fill", function(d) {
            return d.status === 'Enter' ? '#00B78C' : '#EC7E6B';
        }).attr("r", function(d) {
            return radiusScale(+d[selectedData]);
        })
        .on('mouseover', showDetail)
        .on('mouseout', hideDetail);
}

//nodes,colorScale,'family',true
function drawCircles(data) {
    circlesBindData(data);
    circlesExit();
    circlesTransition();
    circlesEnter();
}

// multiline chart for top 5 importers

function chart2() {
    var topImporters = dataEnterSorted.slice(-5);
    //console.log("chart2");
    //console.log(topImporters);

    var topImporters2 = [];

    for (var i = 0; i < topImporters.length; i++) {
        for (var j = 0; j < 10; j++) {
            var obj1 = {};
            var field = 'data' + (2009 + j);
            obj1.year = +(2009 + j);
            obj1.import = topImporters[i][field];
            obj1.country = topImporters[i].country;
            topImporters2.push(obj1);
        }
    }

    var dataByImportCountry = d3.nest()
        .key(function(d) {
            return d.country;
        })
        .entries(topImporters2);

    var dataByYear = d3.nest()
        .key(function(d) {
            return d.year;
        })
        .entries(topImporters2);

    var line = d3.line()
        .x(function(d) {
            return x2(d.year);
        })
        .y(function(d) {
            return y2(d.import);
        })
        .curve(d3.curveBasis);

    g2.append("g")
        .attr("class", "axis axis--x")
        .style("font-size", 13)
        .attr("transform", "translate(0," + (height2) + ")")
        .call(xAxis2);

    g2.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0,0)")
        .call(yAxis2)
        .append("text")
        .attr("class", "titles")
        .attr("transform", "rotate(-90)")
        .attr("x", -115)
        .attr("y", -60)
        .attr("dy", ".71em")
        .attr("fill", "black")
        .style("font-family", "PT Sans Narrow")
        .style("font-size", 16)
        .style("text-anchor", "middle")
        .text("Natural Gas Imports (Million cubic meters)");

    var colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(["#96D9C6", "#24A6A6", "#248EA6", "#1A5A73", "#253B59"]);

    dataByImportCountry.forEach(function(d, i) {
        var pathData = line(d.values);
        g2.append('path')
            .attr('d', pathData)
            .attr('class', 'line')
            .attr('id', 'line_' + d.key)
            .attr('stroke-width', 2)
            .attr('stroke', function(d, j) {
                return colorScale(i);
            })
            .attr("fill", "none");
    });


    var legendData = [{
        "text": "Slovak Republic",
        "color": "#96D9C6"
    }, {
        "text": "France",
        "color": "#24A6A6"
    }, {
        "text": "Netherlands",
        "color": "#248EA6"
    }, {
        "text": "Italy",
        "color": "#1A5A73"
    }, {
        "text": "Germany",
        "color": "#253B59"
    }];

    legend.selectAll("rect")
        .data(legendData) //highest value on top
        .enter()
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("class", "colorBox")
        .attr("fill", function(d) {
            return d.color;
        })
        .style("opacity", 1);

    legend.selectAll("text")
        .data(legendData) //highest value on top
        .enter()
        .append("text")
        .attr("x", 24)
        .attr("y", function(d, i) {
            return 14 + (i * 20);
        })
        .attr("class", "colorText")
        .text(function(d) {
            return d.text;
        })
        .style("font-size", 14)
        .style("opacity", 1);
}

function chart3() {
    var topExporters = dataExitSorted.slice(-6);

    var topExporters = $.grep(topExporters, function(e) {
        return e.country != "Liquefied Natural Gas";
    });

    var topExporters2 = [];

    for (var i = 0; i < topExporters.length; i++) {
        for (var j = 0; j < 10; j++) {
            var obj1 = {};
            var field = 'data' + (2009 + j);
            obj1.year = +(2009 + j);
            obj1.export = topExporters[i][field];
            obj1.country = topExporters[i].country;
            topExporters2.push(obj1);
        }
    }

    var dataByExportCountry = d3.nest()
        .key(function(d) {
            return d.country;
        })
        .entries(topExporters2);

    var line = d3.line()
        .x(function(d) {
            return x2(d.year);
        })
        .y(function(d) {
            return y2(d.export);
        })
        .curve(d3.curveBasis);

    g3.append("g")
        .attr("class", "axis axis--x")
        .style("font-size", 13)
        .attr("transform", "translate(0," + (height2) + ")")
        .call(xAxis2);

    g3.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0,0)")
        .call(yAxis2)
        .append("text")
        .attr("class", "titles")
        .attr("transform", "rotate(-90)")
        .attr("x", -115)
        .attr("y", -60)
        .attr("dy", ".71em")
        .attr("fill", "black")
        .style("font-family", "PT Sans Narrow")
        .style("font-size", 16)
        .style("text-anchor", "middle")
        .text("Natural Gas Exports (Million cubic meters)");

    var colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(["#FFCDB2", "#FFB4A2", "#E5989B", "#B5838D", "#6D6875"]);

    dataByExportCountry.forEach(function(d, i) {
        var pathData = line(d.values);
        g3.append('path')
            .attr('d', pathData)
            .attr('class', 'line')
            .attr('id', 'line_' + d.key)
            .attr('stroke-width', 2)
            .attr('stroke', function(d, j) {
                return colorScale(i);
            })
            .attr("fill", "none");
    });

    var legendData2 = [{
        "text": "Slovak Republic",
        "color": "#FFCDB2"
    }, {
        "text": "Russia",
        "color": "#FFB4A2"
    }, {
        "text": "Ukraine",
        "color": "#E5989B"
    }, {
        "text": "Germany",
        "color": "#B5838D"
    }, {
        "text": "Norway",
        "color": "#6D6875"
    }];

    legend2.selectAll("rect")
        .data(legendData2) //highest value on top
        .enter()
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("class", "colorBox")
        .attr("fill", function(d) {
            return d.color;
        })
        .style("opacity", 1);

    legend2.selectAll("text")
        .data(legendData2) //highest value on top
        .enter()
        .append("text")
        .attr("x", 24)
        .attr("y", function(d, i) {
            return 14 + (i * 20);
        })
        .attr("class", "colorText")
        .text(function(d) {
            return d.text;
        })
        .style("font-size", 14)
        .style("opacity", 1);


}



//helper functions

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(yAxisScale2)
        .ticks(30)
}


d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};




function showDetail(d) {
    // change outline to indicate hover state.

    var texture = textures
        .lines()
        .size(4)
        .strokeWidth(1)
        .stroke(function() {
            return d.status == 'Enter' ? '#00B78C' : '#EC7E6B';
        });

    svg.call(texture);
    d3.select(this).attr('fill', texture.url());


    var content = '<span class="title"><b>' + d.country + '</b></span><br/>' +
        '<span><b>Flow direction: </b>' + d.status + '</span><br/>' +
        '<span><b>Amount: </b>' + d[selectedData] + ' (million cubic meters)';

    d3.selectAll('.tooltip').style('background-image', '-webkit-linear-gradient(top,' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ', ' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ' 40%, transparent 40%, transparent 100%)');
    d3.selectAll('.tooltip').style('background-image', 'linear-gradient(top,' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ', ' + (d.status == 'Enter' ? '#00B78C' : '#EC7E6B') + ' 40%, transparent 40%, transparent 100%)');


    tooltip.showTooltip(content, d3.event);
}
/*
 * Hides tooltip
 */
function hideDetail(d) {
    // reset outline
    d3.select(this)
        .attr('fill', function(d) {
            return d.status == 'Enter' ? '#00B78C' : '#EC7E6B';
        });

    tooltip.hideTooltip();
}




function xposition(i) {
    if (i == 0) {
        return width * 0.3
    } else {
        return width * 0.8
    }
}
