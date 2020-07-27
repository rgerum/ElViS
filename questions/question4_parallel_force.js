class QuestionParallelForces extends Question {
    constructor() {
        super();
        this.title = "Force for Parallel Elements";
        this.text = `

<p>Let's investigate the <b>forces</b> of individual elements in <b>parallel arrangements</b>.</p>
 <p>How do these <b>forces</b> $$F_1$$ and $$F_2$$ relate to the <b>total force</b> $$F$$?</p>
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
<p>Nice! We found that the <b>forces</b> of <b>parallel elements add up</b>.</p>
\\[F = F_1 + F_2 + \\ldots\\]
        `;

        this.text_allowed_elements = `Use the forces $$F1$$, $$F2$$, the spring constants $$k1$$, $$k2$$,`;
    }


    allowed_elements (sim, index) {
        return {
            t: sim.times[index],
            F: sim.dataF[index],
            k1: sim.elements[0].strength,
            k2: sim.elements[1].strength,
            F1: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point])*sim.elements[0].strength,
            F2: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point])*sim.elements[1].strength,
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
        addPlot(this, "", "F1 (N)", color_force,
            ()=>this.sim.points_trajectory.map(x=>(x[this.sim.plot_point]-this.sim.points_trajectory[0][this.sim.plot_point])*this.sim.elements[0].strength))
        addPlot(this, "", "F2 (N)", color_force,
            ()=>this.sim.points_trajectory.map(x=>(x[this.sim.plot_point]-this.sim.points_trajectory[0][this.sim.plot_point])*this.sim.elements[1].strength))
        let slider = addSlider(this);
    }
}
