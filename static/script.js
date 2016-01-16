//2016 JAVASCRIPT

var eventOutputContainer = document.getElementById("message");

// DON'T FORGET TO CHANGE THIS CODE DEPENDING ON THE DATA YOU'RE DISPLAYING IN YOUR TOOLTIP
var tooltip = d3.select("div.tooltip");
var tooltip_category = d3.select("#cat");

var map = L.map('map').setView([22.799606, 113.567950], 9);


    //this is the Mapbox implementation, supply your own access token
    L.tileLayer('https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mapid: 'mapbox.dark',
    accessToken: "pk.eyJ1IjoiYWszNzkzIiwiYSI6ImNpZjdmZ3V5eTBpOXpzaGx6a3hvbjVoemQifQ.Fflvuzl9_moN4a8H_k4m0w"
    }).addTo(map);

    //create variables to store a reference to svg and g elements
    var svg_overlay = d3.select(map.getPanes().overlayPane).append("svg");
    var g_overlay = svg_overlay.append("g").attr("class", "leaflet-zoom-hide");

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g_line = svg.append("g").attr("class", "leaflet-zoom-hide");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");


    function projectPoint(x, y) {
  	return map.latLngToLayerPoint(new L.LatLng(y, x));
    }

    function projectStream(x, y) {
  	   var point = projectPoint(x, y);
  	    this.stream.point(point.x, point.y);
    }

    var transform = d3.geo.transform({point: projectStream}),
        path = d3.geo.path().projection(transform);

    var slidervalue = document.getElementById("slider").value;

    function updateData(){

      request = "/getData"
      console.log(request);

      g.selectAll("circle").remove()
      g_line.selectAll("path").remove()

        d3.json(request, function(error, data) {
            if (error) return console.error(error);

        var pointData = data.features.filter(function(d) {
          return d.geometry.type == "Point";
        })
        var pathData = data.features.filter(function(d) {
          return d.geometry.type == "LineString";
        })

        console.log(pointData);
        console.log(pathData);

        //create placeholder circle geometry and bind it to data
        var circles = g.selectAll("circle").data(pointData);

          circles.enter()
            .append("circle")
            .on("mouseover", function(d){
              tooltip.style("visibility", "visible");
              tooltip_category.text("Category: " + d.properties.type);
            })
            .on("mousemove", function(){
              tooltip.style("top", (d3.event.pageY-10)+"px")
              tooltip.style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(){
              tooltip.style("visibility", "hidden");
            })
            .attr("r",7)
            .attr("fill-opacity", .3)
            .style("fill", "white");

        var lines = g_line.selectAll("path").data(pathData);
            lines.enter().append("path")


            map.on("viewreset", update);
            update();
            transition();

        function update() {
          // get bounding box of data
            var bounds = path.bounds(data),
                topLeft = bounds[0],
                bottomRight = bounds[1];
            var buffer = 50;
            // reposition the SVG to cover the features.
            svg .attr("width", bottomRight[0] - topLeft[0] + (buffer * 2))
                .attr("height", bottomRight[1] - topLeft[1] + (buffer * 2))
                .style("left", (topLeft[0] - buffer) + "px")
                .style("top", (topLeft[1] - buffer) + "px");

            g   .attr("transform", "translate(" + (-topLeft[0] + buffer) + "," + (-topLeft[1] + buffer) + ")");
            g_line.attr("transform", "translate(" + (-topLeft[0] + buffer) + "," + (-topLeft[1] + buffer) + ")");

            // update circle position and size
            circles
              .attr("cx", function(d) { return projectPoint(d.geometry.coordinates[0], d.geometry.coordinates[1]).x; })
              .attr("cy", function(d) { return projectPoint(d.geometry.coordinates[0], d.geometry.coordinates[1]).y; })
              ;

            lines
              .attr("d", path)
        };
        console.log(lines)

        function transition() {
             lines.transition()
                 .duration(7500)
                 .attrTween("stroke-dasharray", tweenDash)
                 .each("end", function() {
                     d3.select(this).call(transition);// infinite loop
                 });
         }

         // this function feeds the attrTween operator above with the
         // stroke and dash lengths
         function tweenDash() {
             return function(t) {
                 //total length of path (single value)
                 var l = lines.node().getTotalLength();

                 // this is creating a function called interpolate which takes
                 // as input a single value 0-1. The function will interpolate
                 // between the numbers embedded in a string. An example might
                 // be interpolatString("0,500", "500,500") in which case
                 // the first number would interpolate through 0-500 and the
                 // second number through 500-500 (always 500). So, then
                 // if you used interpolate(0.5) you would get "250, 500"
                 // when input into the attrTween above this means give me
                 // a line of length 250 followed by a gap of 500. Since the
                 // total line length, though is only 500 to begin with this
                 // essentially says give me a line of 250px followed by a gap
                 // of 250px.
                 interpolate = d3.interpolateString("0," + l, l + "," + l);
                 //t is fraction of time 0-1 since transition began
                 var marker = d3.select("#marker");
                 // p is the point on the line (coordinates) at a given length
                 // along the line. In this case if l=50 and we're midway through
                 // the time then this would 25.
                 var p = lines.node().getPointAtLength(t * l);
                 //Move the marker to that point
                 marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
                 console.log(interpolate(t))
                 return interpolate(t);
             }
         } //end tweenDash

          update()
          changeSlider();})


        }

        function changeSlider(){
          console.log(document.getElementById("slider").value)

          g.selectAll("circle")
            .attr("r",7)
            .attr("fill-opacity", .3)
            .style("fill", "white")
            .filter( function (d) {return(d.properties.time == document.getElementById("slider").value)})
              .attr("fill-opacity", 1)
              .style("fill", "#FFB218")
              .attr("r", 10)
        };
// call function to update geometry


  ;
;
    updateData();
