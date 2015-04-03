window.charts = function () {
    return {
        drawDailyGraph: function (data, selector) {
            if (!data)
                return;

            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = 500 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .range([0, width])
                .nice();
            var y = d3.scale.linear()
                .range([height, 0]);
            var g = {
                x: x,
                y: y,
                xAxis: d3.svg.axis()
                    .scale(x)
                    .tickFormat(d3.format('d'))
                    .orient('bottom'),
                yAxis: d3.svg.axis()
                    .scale(y)
                    .orient('left'),
                line: d3.svg.line()
                    .x(function (d) {
                        return x(d.hour)
                    })
                    .y(function (d) {
                        return y(d.avg)
                    })
                    .interpolate('bundle'),
                deviation: d3.svg.area()
                    .x(function (d) {
                        return x(d.hour)
                    })
                    .y0(function (d) {
                        return y(d.avg - 1.96 * d.stddev)
                    })
                    .y1(function (d) {
                        return y(d.avg + 1.96 * d.stddev)
                    })
                    .interpolate('bundle'),
            };

            var xDomain = d3.extent(data, function (d) {
                return d.hour;
            });
            var yDomain = [0, 32];
            // yDomain = [
            //     yDomain[0] - 0.3 * (yDomain[1] - yDomain[0]),
            //     yDomain[1] + 0.3 * (yDomain[1] - yDomain[0])
            // ];
            g.x.domain(xDomain);
            g.y.domain(yDomain);

            g.svg = d3.select(selector).select('svg').remove();
            g.svg = d3.select(selector).append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.svg.append("path")
                .datum(data)
                .filter(function (d) {
                    return !(d.stddev)
                })
                .attr("class", "area")
                .attr("d", g.deviation);

            g.svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", g.line);
            g.svg.append("g")

                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(g.xAxis)
                .append('text')
                .attr("x", width)
                .attr("dy", "-.71em")
                .style("text-anchor", "end")
                .text("Hour");

            g.svg.append("g")
                .attr("class", "y axis")
                .call(g.yAxis)
                .append('text')
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("People")
        }
    }
}();
