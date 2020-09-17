class QuestionSeriesForce extends Question {
    constructor() {
        super();
        this.title = "Forces of Serial Elements";
        this.text = `

<p>We continue with investigating the <b>forces</b> of <b>serial</b> elements.</p>
<p>What is the <b>total force</b> $$F$$, given the forces $$F_1$$ and $$F_2$$ of the <b>single springs</b>?</p>
            `;
        this.test_cases = [{
            "name": "Spring (k1 = 1 N/m, k2 = 1 N/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Spring stiff (k1 = 0.5 N/m, k2 = 2 N/m)",
                "plot_point": 2,
                "points": [[0, 0], [1, 1], [1,2]],
                "elements": [["Spring", 0, 1, 0.5, 1], ["Spring", 1, 2, 2, 1]],
                "input": ["Displacement", "Rectangle", 1, 0, 1]
            }
        ];
        this.text_finshed = `
<p>Correct! The <b>forces</b> of <b>serial</b> elements must be <b>the same</b>.</p>
\\[F = F_1 = F_2\\]
<p>This is a direct consequence of <b>Newton's third law</b>.</p>
        `;

        this.text_allowed_elements = `Use the forces $$F1$$, $$F2$$, the spring constants $$k1$$, $$k2$$,`;
    }

    allowed_elements (sim, index) {
        let k1 = sim.elements[0].strength;
        let k2 = sim.elements[0].strength;
        let k = 1/(1/k1+1/k2);
        return {
            k : k,
            t: sim.times[index],
/*            F: sim.dataF[index],*/
            k1: k1,
            k2: k2,
            F1: sim.dataF[index],
            F2: sim.dataF[index],
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("k1", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("k2", v=>this.sim.elements[1].strength = v, this.updateSim.bind(this));
        addInput("d", v=>this.sim.external[0].strength = v, this.updateSim.bind(this), 2);

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Displacement", "Rectangle", 2, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        this.plot1 = addPlotDisplacement(this, "input");
        this.display = addDisplay(this, 150);
        this.plot1 = addPlotForce(this, "output");
        addPlot(this, "", "F1 (N)", color_force,
            ()=>this.sim.dataF)
        addPlot(this, "", "F2 (N)", color_force,
            ()=>this.sim.dataF)
        let slider = addSlider(this);
    }
}
