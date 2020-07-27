class QuestionSeriesDisplacement extends Question {
    constructor() {
        super();
        this.title = "Displacements for Serial Elements";
        this.text = `

<p>Now we have a look at a system of <b>two springs</b> in <b>series</b>, which means they are connected end-to-end.</p> 
<p>How can the <b>total displacement</b> $$d$$ of the system be calculated from the displacements $$d_1$$ and $$d_2$$ of the <b>individual springs</b>?</p>
            `;
        this.test_cases = [{
            "name": "Spring (k1 = 1 N/m, k2 = 1 N/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Spring stiff (k1 = 0.5 N/m, k2 = 2 N/m)",
                "plot_point": 2,
                "points": [[0, 0], [1, 1], [1,2]],
                "elements": [["Spring", 0, 1, 0.5, 1], ["Spring", 1, 2, 2, 1]],
                "input": ["Force", "Rectangle", 1, 0, 1]
            }
        ];
        this.text_finshed = `
<p>Of course! The <b>displacements</b> of elements in <b>series</b> <b>add up</b>.</p>
\\[d = d_1 + d_2 +  \\ldots\\]
        `;

        this.text_allowed_elements = `Use the displacements $$d1$$, $$d2$$, the spring constants $$k1$$, $$k2$$,`;
    }

    allowed_elements (sim, index) {
        return {
            t: sim.times[index],
/*            F: sim.dataF[index],*/
            k1: sim.elements[0].strength,
            k2: sim.elements[1].strength,
            d1: (sim.points_trajectory[index][1]-sim.points_trajectory[0][1]),
            d2: (sim.points_trajectory[index][2]-sim.points_trajectory[0][2])-(sim.points_trajectory[index][1]-sim.points_trajectory[0][1]),
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$d$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("k1", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("k2", v=>this.sim.elements[1].strength = v, this.updateSim.bind(this));
        addInput("F", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        this.plot1 = addPlotForce(this, "input");
        this.display = addDisplay(this, 150);
        this.plot1 = addPlotDisplacement(this, "output");
        addPlot(this, "", "d1 (m)", color_displacement,
            ()=>this.sim.points_trajectory.map(x=>(x[1]-this.sim.points_trajectory[0][1])))
        addPlot(this, "", "d2 (m)", color_displacement,
            ()=>this.sim.points_trajectory.map(x=>(x[2]-this.sim.points_trajectory[0][2])-(x[1]-this.sim.points_trajectory[0][1])))
        let slider = addSlider(this);
    }
}
