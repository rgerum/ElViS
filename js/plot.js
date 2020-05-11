class Plot {
    constructor(selection, {width = 640, height = 250, innerwidth=undefined, innerheight=undefined, top = 20, right = 50, bottom = 55, left = 50, xlabel="", ylabel= "", colors=undefined}={}) {
        this.width = width;
        this.height = height;
        this.xlabel = xlabel;
        this.ylabel = ylabel;
        var svg, draw_line = undefined;
        this.selection = selection;
        var margin = {top: top, right: right, bottom: bottom, left: left};
        if(innerwidth == undefined)
            innerwidth = this.width - margin.left - margin.right;
        if(innerheight == undefined)
            innerheight = this.height - margin.top - margin.bottom;

        if(width != undefined) {
            this.selection = selection.attr("width", this.width)
                .attr("height", this.height)
        }
        this.selection = this.selection.append("g")
            .attr("class", "plot")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        this.x_scale = d3.scaleLinear()
            .range([0, innerwidth])
            .domain([0, 1])

        this.y_scale = d3.scaleLinear()
            .range([innerheight, 0])
            .domain([0, 1])

        this.x_axis = d3.axisBottom()
            .scale(this.x_scale)
        //     .orient("bottom") ;

        this.y_axis = d3.axisLeft()
            .scale(this.y_scale)

        if(colors != undefined)
            this.color = (d,i) => colors[i];
        else
            this.color = (d,i) => d3.schemeCategory10[i];

        this.draw_line = d3.line()
            //   .interpolate("basis")
            .x(d => this.x_scale(d[0]))
            .y(d => this.y_scale(d[1]))

        this.x_axis_svg = this.selection.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + innerheight + ")")
        this.x_axis_svg.call(this.x_axis)
            .append("text")
            .attr("dy", "4em")
            .attr("x", innerwidth/2)
            .style("text-anchor", "center")
            .attr("class", "x label")
            .text(this.xlabel) ;

        this.y_axis_svg = this.selection.append("g")
            .attr("class", "y axis")
            .call(this.y_axis)

        this.y_axis_svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerheight/2)
            .attr("dy", "-3em")
            .style("text-anchor", "center")
            .attr("class", "y label")
            .text(this.ylabel);
        this.y_axis_svg.selectAll(".tick").selectAll("text").attr("x", -18);

        this.line_group = this.selection.append("g")
        this.cursor = undefined;
        this.legend_group = undefined;
    }

    legend(x, y) {
        this.legend_group = this.selection.append("g")
            .attr("transform", `translate(${x}, ${y})`)
            .attr("class", "legend")
    }

    setXlim(min, max) {
        this.x_scale.domain([min, max]);
        this.x_axis_svg.call(this.x_axis).selectAll("path");
        this.x_axis_svg.selectAll(".tick").selectAll("text").attr("dy", 18);
    }
    setYlim(min, max) {
        this.y_scale.domain([min, max]);
        this.y_axis_svg.call(this.y_axis).selectAll("path");
        this.y_axis_svg.selectAll(".tick").selectAll("text").attr("dx", -10);
    }
    setXLabel(label) {
        this.x_axis_svg.selectAll(".label").text(label)
    }
    setYLabel(label) {
        this.y_axis_svg.selectAll(".label").text(label)
    }

    setData(datasets, labels) {
        /*
        this.setXlim(d3.min(datasets, function(d) { return d3.min(d.x); }),
            d3.max(datasets, function(d) { return d3.max(d.x); }));
        this.setYlim(d3.min(datasets, function(d) { return d3.min(d.y); }),
            d3.max(datasets, function(d) { return d3.max(d.y); }));
        */
        var line = d => d3.line().x(d => this.x_scale(d[0])).y(d => this.y_scale(d[1]))(d3.zip(d.x, d.y));

        var paths = this.line_group.selectAll("path")
            .data(datasets)

        paths.enter().append("path")
            .attr("class", "plot_line")
            .merge(paths)
            .attr("d", line).attr("fill", "none").attr("stroke", this.color)

        if(this.legend_group)
            this.update_legend(labels);
    }
    update_legend(labels) {
        let w = 20, dw = 5, dy = 18;
        let colors = this.color;
        let self = this;
        this.legend_group.selectAll("g").data(labels).each(function(d,i) {
            d3.select(this).select("text").text(d)
        }).enter().append("g").each(function(d,i) {
                d3.select(this).append("line")
                    .attr("x1", 0).attr("x2", w)
                    .attr("y1", i * dy)
                    .attr("y2", i * dy)
                    .attr("fill", "none")
                    .style("stroke", colors(d, i))
                    .attr("stroke-width", 3)

                var mousemover = () => {
                    console.log("hover", d, i);
                    self.line_group.selectAll("path")
                        .attr("filter", (d, ii) => ii == i ? "saturate(1)" : "saturate(0)")
                        .attr("opacity", (d, ii) => ii == i ? "1" : "0.4")
                }
                var mouseout = () => {
                    console.log("hover", d, i);
                    self.line_group.selectAll("path")
                        .attr("filter", "none")
                        .attr("opacity", "1")
                }
                d3.select(this).append("text")
                    .attr("x", w + dw).attr("y", i * dy + 4)
                    .style("text-anchor", "start")
                    .attr("class", "annotation")
                    .attr("cursor", "pointer")
                    .text(d)
                    .on("mouseover", mousemover)
                    .on("mouseout", mouseout)
                    .on("click", () => {
                        let obj = d3.select(self.line_group.selectAll("path").nodes()[i]);
                        let new_vis = obj.attr("visibility") == "hidden"
                        obj.attr("visibility", new_vis ? "visible" : "hidden");

                        mouseout();
                        console.log(d3.select(self.legend_group.selectAll("g").nodes()[i]).select("line").node());
                        d3.select(self.legend_group.selectAll("g").nodes()[i]).select("line").attr("filter", new_vis ? "saturate(1)" : "saturate(0) brightness(1.2)")
                        //(new_vis ? mousemover : mouseout)();
                    })
            }
        )
    }
    mouseover(i) {
        this.line_group.selectAll("path")
            .attr("filter", (d, ii) => ii == i ? "saturate(1)" : "saturate(0)")
            .attr("opacity", (d, ii) => ii == i ? "1" : "0.4")
    }
    mouseout(i) {
        this.line_group.selectAll("path")
            .attr("filter", "none")
            .attr("opacity", "1")
    }
    setYData(datasets, labels) {
        /*
        this.setXlim(0,
            d3.max(datasets, function(d) { return d.length-1; }));
        this.setYlim(d3.min(datasets, function(d) { return d3.min(d); }),
            d3.max(datasets, function(d) { return d3.max(d); }));
*/
        var line = d3.line().x((_, i) => this.x_scale(i)).y(d => this.y_scale(d));
        this.data = datasets;
        this.line = line;

        var paths = this.line_group.selectAll("path")
            .data(datasets).attr("d", line).attr("fill", "none").attr("stroke", this.color)
            .attr("class", (d,i) => "plot_line "+labels[i]);

        paths.enter().append("path")
            .attr("class", "plot_line")
            .attr("d", line).attr("fill", "none").attr("stroke", this.color)
            .attr("class", (d,i) => "plot_line "+labels[i]);

        if(this.legend_group)
            this.update_legend(labels);
    }
    setCursor(x, y) {
        if(this.cursor === undefined) {
            this.cursor = this.selection.append("circle");
            this.cursor.attr("fill", this.color).attr("r", "5px");
        }
        this.cursor.attr("cx", this.x_scale(x))
        this.cursor.attr("cy", this.y_scale(y))
    }
}

class Display {
    constructor(selection, {width = 640, height = 150, innerwidth=undefined, innerheight=undefined, top = 0, right = 0, bottom = 0, left = 0, xlabel="", ylabel= "", colors=undefined}={}) {
        this.width = width;
        this.height = height;
        this.xlabel = xlabel;
        this.ylabel = ylabel;
        var svg, draw_line = undefined;
        this.selection = selection;
        var margin = {top: top, right: right, bottom: bottom, left: left};
        if(innerwidth == undefined)
            innerwidth = this.width - margin.left - margin.right;
        if(innerheight == undefined)
            innerheight = this.height - margin.top - margin.bottom;

        if(width != undefined) {
            this.selection = selection.attr("width", this.width)
                .attr("height", this.height)
        }
        this.selection = this.selection.append("g")
            .attr("class", "plot")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        this.scale = d3.scaleLinear()
            .range([0, innerwidth])
            .domain([-1, 5])

        this.line_group = this.selection.append("g").attr("class", "elements")
        this.point_group = this.selection.append("g").attr("class", "points")
    }

    setXlim(min, max) {
        this.x_scale.domain([min, max]);
        this.x_axis_svg.call(this.x_axis).selectAll("path");
        this.x_axis_svg.selectAll(".tick").selectAll("text").attr("dy", 18);
    }
    setYlim(min, max) {
        this.y_scale.domain([min, max]);
        this.y_axis_svg.call(this.y_axis).selectAll("path");
        this.y_axis_svg.selectAll(".tick").selectAll("text").attr("dx", -10);
    }
    setXLabel(label) {
        this.x_axis_svg.selectAll(".label").text(label)
    }
    setYLabel(label) {
        this.y_axis_svg.selectAll(".label").text(label)
    }

    setData(datasets, labels) {
        /*
        this.setXlim(d3.min(datasets, function(d) { return d3.min(d.x); }),
            d3.max(datasets, function(d) { return d3.max(d.x); }));
        this.setYlim(d3.min(datasets, function(d) { return d3.min(d.y); }),
            d3.max(datasets, function(d) { return d3.max(d.y); }));
        */
        var line = d3.line().x(d => this.scale(d[0])).y(d => this.scale(d[1]));

        var paths = this.line_group.selectAll(".element")
            .data(datasets)

        paths.enter().append("g")
            .attr("class", "element")
            .on("mouseover", function() { d3.select(this).attr("stroke-width", 3);})
            .on("mouseout", function() { d3.select(this).attr("stroke-width", 1);})
            .on("click", function(d, i) { selectedElement(i);} )
            .merge(paths)
            .each(function(d, i) {
                let p = d3.select(this).selectAll("path").data(d)
                p.enter().append("path")
                    .merge(p)
                    .attr("d", line).attr("fill", "none").attr("stroke", "darkgreen")
                p.exit().remove();
            })
        paths.exit().remove();
    }

    setPoints(dataset, sim) {
        var paths = this.point_group.selectAll(".point")
            .data(dataset)

        let display = this;

        paths.enter().append("circle")
            .attr("class", "point")
            .attr("r", "5px")
            .on("mouseover", function() { d3.select(this).attr("r", "8px");})
            .on("mouseout", function() { d3.select(this).attr("r", "5px");})
            .call(d3.drag()
                .on("drag", function(d, i) {
                    sim.points[i][1] = display.scale.invert(d3.event.x);
                    display.setData(sim.draw());
                    display.setPoints(sim.get_points(), sim);
                    console.log(display.scale.invert(d3.event.x));
                })
                .on("end", function(d, i) {
                    updateSystem();
                })
            )
            .merge(paths)
            .attr("cx", d => this.scale(d[1]))
            .attr("cy", d => this.scale(0))
            .style("fill", d => d[0] ? "blue" : "red")
        paths.exit().remove();
    }

}