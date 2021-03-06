var width = document.getElementById('usmap-container').offsetWidth,
	height = width * 4 / 10,
	centered;

map();

var DataCertifiedJob

function map() {
	d3.csv('USmap/acceptanceRateByState.csv', function (error, data) {
		var dataset = data;

		arrayHelp = [];
		//using nest to create a json structure with key-id
		var num_case_status = d3.nest()
			.key(function (d) { return d.Id })
			.entries(dataset)

		//changing 'key' - 'id'
		for (i in num_case_status) {
			num_case_status[i].id = +num_case_status[i].key;
			arrayHelp.push(+num_case_status[i].key);//pushes to 'arrayHelp' array for future references
			delete num_case_status[i].key;
		}

		num_case_status = num_case_status.filter(function (d) { if (d.id) { return d } })

		console.log(num_case_status)
		//US map graph 
		var projection = d3.geo.albersUsa()
			.scale(1280)
			.translate([width / 2, height / 2]);

		var domain = [0, 2, 3];

		var path = d3.geo.path()
			.projection(projection);

		var svg = d3.select("#usmap").append("svg").attr('id', 'US_map') //add svg with id=US_map
			.attr("width", width)
			.attr("height", height);

		var colormap_P = d3.scale.quantile() //Calulates color domain based on percentage
			.domain([30, 55])
			// .range(['red', 'red', '#ffc107', '#ffeb3b', '#8bc34a', '#259b24']);
			.range(['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']);
		// .range(['#EFEFFF', '#000080']);

		var colormap_N = d3.scale.quantile() ////Calulates color domain based on number
			.domain([d3.min(data, function (d) { return +d.Certified; }), d3.max(data, function (d) { return +d.Certified; })])
			.range(['#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']);
			// .range(['#deebf7', '#c6dbef', '#AFE4FD', '#9DE1FF', '#AEDFF2', '#9ecae1', '#6baed6', '#54CBFF', '#42C0FB', '#0BB5FF', '#2171b5', '#08519c', '#08306b']);
		// .domain([0, d3.max(data, function (d) { return +d.Certified; })])
		// .range(['#EFEFFF', '#000080']);

		d3.select('#usmap').remove(); //help remove on update

		var svg1 = d3.select('#usmap-container').append('div').attr('id', 'usmap') //add div back in

		var svg = d3.select("#usmap").append("svg").attr('id', 'US_map') //add svg with id=US_map back
			.attr("width", width)
			.attr("height", height);

		svg.append("rect")
			.attr("class", "background")
			.attr("width", width)
			.attr("height", height)
			.on("click", clicked);

		var g = svg.append("g");

		var mapTooltip = d3.select('body').append("div").attr("class", "toolTip");

		//import data for drawing the US MAP
		d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json", function (error, us) {
			if (error) throw error;

			g.append("g")
				.attr("id", "states")
				.selectAll("path")
				.data(topojson.feature(us, us.objects.states).features)
				.enter().append("path")
				.attr("d", path)
				.style('fill', function (d) { return changeColors(d); })
				.on("click", clicked)
				.on('mousemove', function (d, i) {
					mapTooltip.style("left", d3.event.pageX + 15 + "px");
					mapTooltip.style("top", d3.event.pageY + 5 + "px");
					mapTooltip.style("display", "inline");
					mapTooltip.html(viewMapTooltip(d));
					var currentState = this;
					d3.select(this)
						.style('fill-opacity', .5)
						.style('cursor', 'pointer');
				})
				.on('mouseout', function (d, i) {
					mapTooltip.style("display", "none");
					d3.select(this)
						.transition()
						.duration(200)
						.style({
							'fill-opacity': 1
						});
				});

			g.append("path")
				.datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
				.attr("id", "state-borders")
				.attr("d", path);

		});


		var head_id = 0;
		var Certified = 0;
		var Denied = 0;
		var Certified_Expired = 0;
		var Withdrawn = 0;
		var total = 0;
		var certified_scale = 0;

		//function to help change color scale across map on user request based on Percentage or number
		function changeColors(d) {
			console.log(d);
			var index = arrayHelp.indexOf(+d.id); //gets the index of the id

			if (num_case_status[index]) { //if present
				head_id = num_case_status[index].id
				Certified = +num_case_status[index].values[0].Certified;
				Denied = +num_case_status[index].values[0].Denied;
				Certified_Expired = +num_case_status[index].values[0].Certified_Expired;
				Withdrawn = +num_case_status[index].values[0].Withdrawn;

				total = Certified + Denied + Certified_Expired + Withdrawn;

				if (document.getElementById('usmap-radio-percent').checked) {
					//Percentage radio button is checked

					certified_scale = Certified / total * 100;

					return colormap_P(certified_scale); //return to color scale based on Percentage

				} else if (document.getElementById('usmap-radio-number').checked) {
					//Number radio button is checked

					certified_scale = Certified

					return colormap_N(certified_scale); //return to color scale based on Number

				}

			}

		}//end of changeColors()

		function viewMapTooltip(d) {
			var index = arrayHelp.indexOf(+d.id); //gets the index of the id

			if (num_case_status[index]) { //if present
				head_id = num_case_status[index].id
				state = num_case_status[index].values[0].State;
				Certified = +num_case_status[index].values[0].Certified;
				Denied = +num_case_status[index].values[0].Denied;
				Certified_Expired = +num_case_status[index].values[0].Certified_Expired;
				Withdrawn = +num_case_status[index].values[0].Withdrawn;
				total = Certified + Denied + Certified_Expired + Withdrawn;

				if (document.getElementById('usmap-radio-percent').checked) {
					//Percentage radio button is checked
					Certified = (Certified / total * 100).toFixed(2);
					Certified_Expired = (Certified_Expired / total * 100).toFixed(2);
					Denied = (Denied / total * 100).toFixed(2);
					Withdrawn = (100 - Certified - Denied - Certified_Expired).toFixed(2);

					output = "<strong style='font-size: 20px; line-height: 32px'>" + state + "</strong>"
						+ "<br>Certified: <strong>" + Certified + "%</strong>"
						+ "<br>Certified-Expired: <strong>" + Certified_Expired + "%</strong>"
						+ "<br>Denied: <strong>" + Denied + "%</strong>"
						+ "<br>Withdrawn: <strong>" + Withdrawn + "%</strong>";
					return output; //return to color scale based on Percentage

				} else if (document.getElementById('usmap-radio-number').checked) {
					//Number radio button is checked
					output = "<strong style='font-size: 20px; line-height: 32px'>" + state + "</strong>"
						+ "<br>Certified: <strong>" + Certified + "</strong>"
						+ "<br>Certified-Expired: <strong>" + Certified_Expired + "</strong>"
						+ "<br>Denied: <strong>" + Denied + "</strong>"
						+ "<br>Withdrawn: <strong>" + Withdrawn + "</strong>";
					return output;

				}
			}
		}

		//On click function
		function clicked(d) {
			mapTooltip.style("display", "none"); // Make tooltip disappear
			zoom(d); //zooms in

			// Set timeout to wait for zoom to finish
			setTimeout(
				function () {
					//do something special
					if (d) {
						var id = 0;
						id = +d.id;

						// d3.select('.modal').transition().duration(1000).style('display', 'block');
						modal.style.display = "block";

						displayChart(id); //call function to display chart
						// displayPieChart(id);

						// When the user clicks on <span> (x), close the modal
						span.onclick = function () {
							modal.style.display = "none";
							zoom(d); //zooms out
							//location.reload();
							// Enable scrolling
							$('body').css('overflow', 'auto');
							$(window).unbind('scroll');
						}

						// When the user clicks anywhere outside of the modal, close it
						window.onclick = function (event) {
							if (event.target == modal) {
								modal.style.display = "none";
								zoom(d); //zooms out
								// Enable scrolling
								$('body').css('overflow', 'auto');
								$(window).unbind('scroll');
							}
						}
					}
				}, 800);

			//function to zoom the map
			function zoom(d) {
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
					.classed("active", centered && function (d) { return d === centered; });

				g.transition()
					.duration(750)
					.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
					.style("stroke-width", 1.5 / k + "px");

			}//end of zoom()

			// Code to disable scrolling
			var top = $(window).scrollTop();
			var left = $(window).scrollLeft();
			$('body').css('overflow', 'hidden');
			$(window).scroll(function () {
				$(this).scrollTop(top).scrollLeft(left);
			});

		} //end of clicked()






		////////////-------------  Displays Charts  -----------------//////////////

		//Declare new margin, width and height for the graph inside model
		var m = { top: 20, right: 30, bottom: 30, left: 40 },
			w = 500 - m.left - m.right,
			h = 400 - m.top - m.bottom;



		function displayChart(id) {

			if (arrayHelp.indexOf(+id) != -1) {

				var index = arrayHelp.indexOf(+id);

				d3.select('#for_entries').selectAll('p').data(['a']).enter().append('p').append('h3').text('State: ' + num_case_status[index].values[0].State);
				d3.select('#for_entries').selectAll('p').remove();
				d3.select('#for_entries').selectAll('p').data(['a']).enter().append('p').append('h3').text('State: ' + num_case_status[index].values[0].State);

				// console.log(num_case_status[index].values[0].State);

				head_id = num_case_status[index].id
				Certified = +num_case_status[index].values[0].Certified;
				Denied = +num_case_status[index].values[0].Denied;
				Certified_Expired = +num_case_status[index].values[0].Certified_Expired;
				Withdrawn = +num_case_status[index].values[0].Withdrawn;
				total = Certified + Denied + Certified_Expired + Withdrawn;

				if (document.getElementById('usmap-radio-percent').checked) {
					//Percentage radio button is checked
					Certified = Certified / total * 100;
					Denied = Denied / total * 100;
					Certified_Expired = Certified_Expired / total * 100;
					Withdrawn = Withdrawn / total * 100;
				}

				var data1 = [{ 'State': 'Certified', 'Certified': Certified },
				{ 'State': 'Denied', 'Certified': Denied },
				{ 'State': 'Certified_Expired', 'Certified': Certified_Expired },
				{ 'State': 'Withdrawn', 'Certified': Withdrawn }]


				var x = d3.scale.ordinal()
					.rangeRoundBands([0, w], .1);

				var x0 = d3.scale.ordinal();

				var y = d3.scale.linear()
					.range([h, 0]);

				var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom");

				var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left");

				var colorRange = d3.scale.category20();
				var color = d3.scale.ordinal()
					.range(colorRange.range());

				var chart = d3.select("#modal-content") // initializes the group
					.attr("width", w + m.left + m.right)
					.attr("height", h + m.top + m.bottom)
					.append("g")
					.attr("transform", "translate(" + m.left + "," + m.top + ")")
					.attr('class', 'helpRemove');

				d3.selectAll('.helpRemove').remove(); //remove the groug to update the scale

				chart = d3.select("#modal-content") //add group back
					.attr("width", w + m.left + m.right)
					.attr("height", h + m.top + m.bottom)
					.append("g")
					.attr("transform", "translate(" + m.left + "," + m.top + ")")
					.attr('class', 'helpRemove');

				x.domain(data1.map(function (d) { return d.State; }));
				y.domain([0, d3.max(data1, function (d) { return +d.Certified; })]);

				chart.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + h + ")")
					.call(xAxis);

				chart.append("g")
					.attr("class", "y axis")
					.call(yAxis);

				chart.selectAll(".bar")
					.data(data1)
					.enter().append("rect")
					.transition()
					.duration(250)
					.attr("class", "bar")
					.attr("x", function (d) { return x(d.State); })
					.attr("y", function (d) { return y(+d.Certified); })
					.attr("height", function (d) { return h - y(+d.Certified); })
					.attr("width", x.rangeBand())
					.style("fill", function (d) { return color(+d.Certified); });

				newCompare();

				////// ------- Add select option on model ------- ///////
				function newCompare() {

					var select = d3.select('#for_entries')
						.append('select')
						.attr('id', 'stateCompare')
						.on('change', onchange);

					d3.selectAll('#stateCompare').remove(); //removes the previously created select option

					var select = d3.select('#for_entries') //creates a new select option
						.append('select')
						.attr('id', 'stateCompare')
						.on('change', onchange);

					var options = select.selectAll('option')
						.data(num_case_status).enter()
						.append('option')
						.attr('value', function (d) { return d.id; })
						.text(function (d) { return d.values[0].State; });

					// when a new value is selected
					function onchange() {
						selectValue = d3.select('#stateCompare').property('value')
						console.log(selectValue);
						var new_data = [num_case_status[index].values[0], num_case_status[arrayHelp.indexOf(+selectValue)].values[0]]
						// delete new_data[0].Id;
						// delete new_data[1].Id;
						// delete new_data[0].Abbreviation;
						// delete new_data[1].Abbreviation;					
						console.log(new_data);

						var options = d3.keys(new_data[0]).filter(function (key) { return (key !== "State" && key !== 'Id' && key !== 'Abbreviation'); });
						console.log(options)

						new_data.forEach(function (d) {
							d.valores = options.map(function (name) { return { name: name, value: +d[name] }; });
							// console.log(d.valores)
						});

						d3.selectAll('.helpRemove').remove(); //remove the groug to update the scale

						chart = d3.select("#modal-content") //add group back
							.attr("width", w + m.left + m.right)
							.attr("height", h + m.top + m.bottom)
							.append("g")
							.attr('width', w)
							.attr("transform", "translate(" + m.left + "," + m.top + ")")
							.attr('class', 'helpRemove')


						x.domain(new_data.map(function (d) { return d.State; }));
						x0.domain(options).rangeRoundBands([0, x.rangeBand()]);
						y.domain([0, d3.max(new_data, function (d) { return d3.max(d.valores, function (d) { return d.value; }); })]);

						chart.append("g")
							.attr("class", "x axis")
							.attr("transform", "translate(0," + h + ")")
							.call(xAxis);

						chart.append("g")
							.attr("class", "y axis")
							.call(yAxis)
							.append("text")
							.attr("transform", "rotate(-90)")
							.attr("y", 6)
							.attr("dy", ".71em")
							.style("text-anchor", "end")
							.text("Number of cases");

						var bar = chart.selectAll(".bar")
							.data(new_data)
							.enter().append("g")
							.attr("class", "rect")
							.attr("transform", function (d) { return "translate(" + x(d.State) + ",0)"; });

						bar.selectAll("rect")
							.data(function (d) { return d.valores; })
							.enter().append("rect")
							.transition()
							.duration(750)
							.attr("width", x0.rangeBand())
							.attr("x", function (d) { return x0(d.name); })
							.attr("y", function (d) { return y(d.value); })
							.attr("value", function (d) { return d.name; })
							.attr("height", function (d) { return h - y(d.value); })
							.style("fill", function (d) { return color(d.name); });

						var divTooltip = d3.select("body").append("div").attr("class", "toolTip");

						bar.on("mousemove", function (d) {

							divTooltip.style("left", d3.event.pageX + 10 + "px");
							divTooltip.style("top", d3.event.pageY - 25 + "px");
							divTooltip.style("display", "inline");
							var x1 = d3.event.pageX, y1 = d3.event.pageY
							var elements = document.querySelectorAll(':hover');
							l = elements.length
							l = l - 1
							elementData = elements[l].__data__
							divTooltip.html((d.State) + "<br>" + elementData.name + "<br>" + elementData.value);

						});
						bar.on("mouseout", function (d) {
							divTooltip.style("display", "none");
						});

						var legend = chart.selectAll(".legend")
							.data(options.slice())
							.enter().append("g")
							.attr("class", "legend")
							.attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

						legend.append("rect")
							.attr("x", w - 18)
							.attr("width", 18)
							.attr("height", 18)
							.style("fill", color);

						legend.append("text")
							.attr("x", w - 24)
							.attr("y", 9)
							.attr("dy", ".35em")
							.style("text-anchor", "end")
							.text(function (d) { return d; });



					} //onchange ends here

				} ///// --- select option on model ends here --- /////

				document.getElementById("stateCompare").selectedIndex = index;


			}
		} //end of DisplayChart


		///////////////////////////////////


		//////////////   Pie Chart   /////////////////////


		d3.json('USmap/jobByState.json', function (error, dataJob) {
			DataCertifiedJob = dataJob;


			DataCertifiedJob.states.sort(function (a, b) {
				return b.certified - a.certified;
			});

			for (i in DataCertifiedJob.states) {
				DataCertifiedJob.states[i].jobGroup = DataCertifiedJob.states[i].jobGroup.splice(0, 5);
			}

			arrayHelp2 = []
			for (i in DataCertifiedJob.states) {
				arrayHelp2.push(+DataCertifiedJob.states[i].id);
			}

			console.log(DataCertifiedJob)
			console.log(arrayHelp2)


		});

		function displayPieChart(id) {
			if (arrayHelp2.indexOf(+id) != -1) {
				var index = arrayHelp2.indexOf(+id);
				var frequency = DataCertifiedJob.states[index].jobGroup
				console.log(frequency)

				var svgPie = d3.select("#contents")
					.append("svg")
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("transform", "translate(100,100)");

				var pie = d3.layout.pie()
					.sort(null)
					.value(function (d) { return d.Certified; });

				var mypie = pie(frequency);
				console.log(mypie);

				var arc = d3.svg.arc();
				arc.outerRadius(100);
				arc.innerRadius(0);

				var color = d3.scale.category10();

				console.log(pie(frequency))

				var divTooltipPie = d3.select("#contents").append("div").attr("class", "toolTip");

				var g = svgPie.selectAll(".fan")
					.data(pie(frequency))
					.enter()
					.append("g")
					.attr("class", "fan")

				g.append("path")
					.attr("d", arc)
					.style("fill", function (d, i) { return color(i); });

				g.on("mousemove", function (d) {

					divTooltipPie.style("left", d3.event.pageX + 10 + "px");
					divTooltipPie.style("top", d3.event.pageY - 25 + "px");
					divTooltipPie.style("display", "inline");
					var x1 = d3.event.pageX, y1 = d3.event.pageY
					var elements = document.querySelectorAll(':hover');
					l = elements.length
					l = l - 1
					elementData = elements[l].__data__
					divTooltipPie.html((d.data.name) + "<br>" + elementData.value);

				});
				g.on("mouseout", function (d) {
					divTooltipPie.style("display", "none");
				});
			}
		}

		///////////////////////////////////



	}); //end of d3.csv
	//end of d3.jsonJobState

} //end of function map()


// function to be called when clicked on the user input radio
function mapColor() {
	map();
}

