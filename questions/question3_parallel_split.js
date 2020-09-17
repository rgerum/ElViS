class QuestionParallelSplit extends Question {
    constructor() {
        super();
        this.title = "Displacement in Parallel Elements";
        this.text = `

<p>Let's analyze in more detail what happens when we deal with elements <b>in parallel</b>.</p>
<p>How is the <b>total displacement</b> $$d$$ related to the <b>displacements</b> $$d_1$$ and $$d_2$$ of the individual springs?</p>
            `;
        this.test_cases = [{
            "name": "Spring (k1 = 1 N/m, k2 = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Spring stiff (k1 = 0.5 N/m, k2 = 2 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 0.5, 1], ["Spring", 0, 1, 2, 1]],
                "input": ["Force", "Rectangle", 1, 0, 1]
            }
        ];
        this.text_finshed = `
        <p>We have seen that the <b>displacement</b> of an individual element within a group of <b>parallel</b> elements is <b>the same</b> as the total
displacement.</p>
\\[d = d_1 = d_2\\]
        `;

        this.text_allowed_elements = `Use the spring constants $$k1$$, $$k2$$, the displacements $$d1$$, $$d2$$,`;
    }

    allowed_elements (sim, index) {
        return {
            t: sim.times[index],
            F: sim.dataF[index],
            k1: sim.elements[0].strength,
            k2: sim.elements[1].strength,
            d1: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point]),
            d2: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point]),
            x: sim.points_trajectory[index][sim.plot_point]
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$d$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("k1", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("k2", v=>this.sim.elements[1].strength = v, this.updateSim.bind(this));
        addInput("F", v=>this.sim.external[0].strength = v, this.updateSim.bind(this), 2);

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Force", "Rectangle", 2, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        this.plot1 = addPlotForce(this, "input");
        this.display = addDisplay(this);
        this.plot1 = addPlotDisplacement(this, "output");

        addPlot(this, "", "d1 (m)", color_displacement,
            ()=>this.sim.points_trajectory.map(x=>(x[this.sim.plot_point]-this.sim.points_trajectory[0][this.sim.plot_point])))
        addPlot(this, "", "d2 (m)", color_displacement,
            ()=>this.sim.points_trajectory.map(x=>(x[this.sim.plot_point]-this.sim.points_trajectory[0][this.sim.plot_point])))

        let slider = addSlider(this);
    }
}

