class QuestionTwoSpringsParallel extends Question {
    constructor() {
        super();
        this.title = "Two Parallel Springs";
        this.text = `

<p>Let's look at a more complicated system of <b>two springs</b> connected <b>in parallel</b>.</p>
   
<p>Again, use the <b>virtual lab</b> to play around with the parameters.</p>

<p>How can the <b>total force</b> $$F$$ be calculated from the <b>total displacement</b> $$d$$ and the individual <b>spring constants</b> $$k_1$$ and $$k_2$$?</p>
            `;
        this.test_cases = [{
            "name": "Spring (k1 = 1 N/m, k2 = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Spring stiff (k1 = 0.5 N/m, k2 = 2 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 0.5, 1], ["Spring", 0, 1, 2, 1]],
                "input": ["Displacement", "Rectangle", 1, 0, 1]
            }
        ];
        this.text_finshed = `
        <p>Correct! For <b>parallel springs</b>, the spring constants <b>add up</b>.</p>
\\[k = k_1 + k_2 + \\ldots\\]
        `;

        this.text_allowed_elements = `Use the spring constants $$k1$$, $$k2$$, the displacement $$d$$`;
    }

    allowed_elements (sim, index) {
        return {
            t: sim.times[index],
            F: sim.dataF[index],
            k1: sim.elements[0].strength,
            k2: sim.elements[1].strength,
            d: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point]),
            x: sim.points_trajectory[index][sim.plot_point]
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("k1", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("k2", v=>this.sim.elements[1].strength = v, this.updateSim.bind(this));
        addInput("d", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        this.plot1 = addPlotDisplacement(this, "input");
        this.display = addDisplay(this);
        this.plot1 = addPlotForce(this, "output");
        let slider = addSlider(this);
    }
}


/*
question_two_parallel_springs = {
    title: "Two Parallel Springs",
    text: `<p>Great, you found out that a spring gives a linear response proportional to the stiffness.</p>
            \\[F = d\\cdot k\\]
            <p>But what if we have a more complicated system made from two springs in parallel?</p>
                        `,
    test_cases: [{
        "name": "Spring (k1 = 1 N/m, k2 = 1 N/m)",
        "plot_point": 1,
        "points": [[0, 0], [1, 1]],
        "elements": [["Spring", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
        "input": ["Displacement", "Rectangle", 1, 0, 1]
    },
        {
            "name": "Spring stiff (k1 = 0.5 N/m, k2 = 2 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 0.5, 1], ["Spring", 0, 1, 2, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        }
    ],
    text_allowed_elements: `Use, the spring constants \\(k1\\), \\(k2\)), the displacement <b>d</b>`,
    allowed_elements: function(sim, index) {
        return {
            t: sim.times[index],
            F: sim.dataF[index],
            k1: sim.elements[0].strength,
            k2: sim.elements[1].strength,
            d: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point]),
            x: sim.points_trajectory[index][sim.plot_point]
        }
    },
    start_callback: function() {
        d3.select("#question_input").text('F');
        console.log("start question 2")
        let sim = new System();


        addInput("k1", v=>sim.elements[0].strength = v, updateSim);
        addInput("k2", v=>sim.elements[1].strength = v, updateSim);
        addInput("F", v=>sim.external[0].strength = v, updateSim);

        d3.select("#playground_content").append("br")

        function updateSim() {
            sim.simulateOverdamped();
            plot1.setXlim(sim.times[0], sim.times[sim.times.length - 1]);
            plot1.setYlim(d3.min(sim.data), d3.max(sim.data));
            plot1.setData([{x: sim.times, y: sim.data}], ["displacement"])
            if(!slider.playing())
                slider.play();
        }

        sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        });
        sim.updateDrawOffsets();
        sim.simulateOverdamped();
        let scale = 3;
        let svg = d3.select("#playground_content").append("svg").attr("width", 300).attr("height", 20);
        let display = new Display(svg, {
            width: 30 * scale,
            height: 30 * scale,
            xlim: [-0.4, 2.4],
            interactive: false
        });
        display.setData(sim.draw());
        display.setPoints(sim.points, sim);

        let plot1 = new Plot(d3.select("#playground_content").append("svg"), {
            xlabel: "time (s)",
            ylabel: "disp. (m)",
            left: 50,
            top: 5,
            bottom: 7,
            innerwidth: 150,
            width: 150 + 50 + 10,
            innerheight: 76,
            height: 76 + 5 + 60
        });
        //let plot2 = new Plot(d3.select("#plot2"), {xlabel: "time (s)", ylabel: "force (N)", left: 100, top:5, bottom: 100, innerheight: 150, height: 150+5+100});

        plot1.setXlim(sim.times[0], sim.times[sim.times.length - 1]);
        plot1.setYlim(d3.min(sim.data), d3.max(sim.data));
        plot1.setData([{x: sim.times, y: sim.data}], ["displacement"])

        plot1.y_axis.ticks(3)
        plot1.y_axis_svg.call(plot1.y_axis)
        plot1.y_axis_svg.selectAll(".tick").selectAll("text").attr("x", -18);

        plot1.x_axis.ticks(7)
        plot1.x_axis_svg.call(plot1.x_axis)

        let slider = new Slider(d3.select("#playground_content").node(), {range: [0, 500-1], width: 300, value: 0, play:true, step: 10});
        slider.setRange(0, sim.times.length-1);
        slider.setValue(0);
        slider.onValueChanged = function(d) {
            d = parseInt(d);
            display.setData(sim.draw(d));
            display.setPoints(sim.get_points(d), sim);
            plot1.setCursor([[sim.times[d], sim.data[d]]]);
            //plot2.setCursor([[sim.times[d], sim.dataF[d]]]);
        };
        slider.play();
    }
}

*/