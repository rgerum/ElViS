class QuestionDashpotParallel extends Question {
    constructor() {
        super();
        this.title = "Parallel Dashpots";
        this.text = `

<p>Let's now consider two dashpots in parallel? Remember what you have learned about springs in parallel.</p>
<p>How does the total force depend on the <b>viscosities</b> $$\\gamma_1$$, $$\\gamma_2$$ and the <b>velocity</b> $$v$$?</p>
            `;
        this.test_cases = [{
            "name": "Dashpot (gamma = 1 Ns/m, gamma = 1 Ns/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Dashpot", 0, 1, 1, 1]],
            "input": ["Displacement", "Ramp", 1, 0, 1]
        },
            {
                "name": "Dashpot (gamma = 0.5 Ns/m, gamma = 2 Ns/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Dashpot", 0, 1, 0.5, 1], ["Dashpot", 0, 1, 2, 1]],
                "input": ["Displacement", "Ramp", 1, 0, 1]
            },
        ];
        this.text_finshed = `
<p>The viscosities of <b>parallel dashpots</b> add up, just like the spring constants of parallel springs.</p>
\\[\\gamma = \\gamma_1 + \\gamma_2 + \\ldots \\]
        `;

        this.text_allowed_elements = `Use the velocity $$v$$, the viscosities $$gamma1$$, $$gamma2$$,`;
    }

    allowed_elements (sim, index) {
        return {
            gamma1 : sim.elements[0].strength,
            gamma2 : sim.elements[1].strength,
            t: sim.times[index],
            F: sim.dataF[index],
            v: sim.dataF[index]/(sim.elements[0].strength+sim.elements[1].strength),
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("gamma1", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("gamma2", v=>this.sim.elements[1].strength = v, this.updateSim.bind(this));
        addInput("v", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Dashpot", 0, 1, 1, 1]],
            "input": ["Displacement", "Ramp", 1, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        this.plot1 = addPlotDisplacement(this, "input");
        this.display = addDisplay(this, 150);
        this.plot1 = addPlotForce(this, "output");
        let slider = addSlider(this);
    }
}
