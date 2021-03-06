class QuestionDashpotSeries extends Question {
    constructor() {
        super();
        this.title = "Dashpots in Series";
        this.text = `

<p>Now we look at two dashpots in series. Recall how spring constants add up in series.</p>
<p>How does the total force depend on the <b>viscosities</b> $$D_1$$, $$D_2$$ and the <b>velocity</b> $$v$$?</p>
<p>You may want to use pen and paper to derive the relationship.</p>
            `;
        this.test_cases = [{
            "name": "Dashpot (D = 1 Ns/m, D = 1 Ns/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Dashpot", 1, 2, 1, 1]],
            "input": ["Displacement", "Ramp", 1, 0, 1]
        },
            {
                "name": "Dashpot (D = 0.5 Ns/m, D = 2 Ns/m)",
                "plot_point": 2,
                "points": [[0, 0], [1, 1], [1, 2]],
                "elements": [["Dashpot", 0, 1, 0.5, 1], ["Dashpot", 1, 2, 2, 1]],
                "input": ["Displacement", "Ramp", 1, 0, 1]
            },
        ];
        this.text_finshed = `
<p>The viscosities of <b>dashpots</b> in <b>series</b> <b>add up reciprocally</b>, just like the spring constants of springs in series.</p>
\\[\\frac{1}{D} = \\frac{1}{D_1} + \\frac{1}{D_2} + \\ldots\\]
        `;

        this.text_allowed_elements = `Use the velocity $$v$$, the viscosities $$D1$$, $$D2$$,`;
    }

    allowed_elements (sim, index) {
        return {
            D1 : sim.elements[0].strength,
            D2 : sim.elements[1].strength,
            t: sim.times[index],
            F: sim.dataF[index],
            v: sim.dataF[index]*(1/sim.elements[0].strength+1/sim.elements[1].strength),
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("D1", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("D2", v=>this.sim.elements[1].strength = v, this.updateSim.bind(this));
        addInput("v", v=>this.sim.external[0].strength = v, this.updateSim.bind(this), 2);

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Dashpot", 1, 2, 1, 1]],
            "input": ["Displacement", "Ramp", 2, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        this.plot1 = addPlotDisplacement(this, "input");
        this.display = addDisplay(this, 150);
        this.plot1 = addPlotForce(this, "output");
        let slider = addSlider(this);
    }
}
