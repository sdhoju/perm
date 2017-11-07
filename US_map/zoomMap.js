var width = window.innerWidth,
    height = window.innerHeight,
    centered;


d3.csv('acceptanceRateByState.csv',function(error,data){
	var dataset=data;

	// var num_case_status =d3.nest()
	// 					.key(function(d){ return d.Abbreviation })
	// 					.key(function(d){ return d.Certified})
	// 					.entries(dataset)

	console.log(data)
	//console.log(num_case_status)

	//var min = d3.min(num_case_status,function(d){ return d.values })			





// var min = d3.min(dataset,funciton(d){return +d.});

var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var domain=[0,2,3];

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var color = d3.scale.linear()
      .domain([0,56])
      .range(['blue','yellow']);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");




d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json", function(error, us) {
  if (error) throw error;
  console.log(us);
  g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .style('fill', function(d){ return color(d.id);})
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
});


	function clicked(d){
		zoom(d); //zooms in
		if(d){
			var id =0;
			id = +d.id;
			console.log(id);
			
			document.getElementById("contents").innerHTML= textDisplay(d);
			
			console.log(d);
			modal.style.display = "block";
			
			// When the user clicks on <span> (x), close the modal
			span.onclick = function() {
			    modal.style.display = "none";
			    zoom(d); //zooms out
			}

			// When the user clicks anywhere outside of the modal, close it
			window.onclick = function(event) {
			    if (event.target == modal) {
			        modal.style.display = "none";
			        zoom(d); //zooms out
			    }
			}
		}
		function zoom(d){
			var x, y, k;

		  if (d && centered !== d) {
		    var centroid = path.centroid(d);
		    x = centroid[0];
		    y = centroid[1];
		    k = 4;
		    centered = d;
		  } else {
		    x = width / 2;
		    y = height / 2;
		    k = 1;
		    centered = null;
		  }
		

		  g.selectAll("path")
		      .classed("active", centered && function(d) { return d === centered; });

		  g.transition()
		      .duration(750)
		      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		      .style("stroke-width", 1.5 / k + "px");
		}
	}

	function textDisplay(d){
		return d.id;
	}

// function clicked(d) {
//   var x, y, k;

//   if (d && centered !== d) {
//     var centroid = path.centroid(d);
//     console.log(centroid)
//     x = centroid[0];

//     y = centroid[1];
    
//     k = 10;
//     centered = d;
//   } else {
//     x = width/2 ;
//     y = height/2 ;
//     k = 1;
//     centered = null;
//   }

//   g.selectAll("path")
//       .classed("active", centered && function(d) { return d === centered; });

//   g.transition()
//       .duration(750)
//       .attr("transform", "translate(" + width /2 + "," + height /2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
//       .style("stroke-width", 1.5 / k + "px");
// }


});

