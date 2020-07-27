class QuestionDashpot extends Question {
    constructor() {
        super();
        this.title = "Force of a Dashpot";
        this.text = `

<p>Now we come to the second element, the <b>dashpot</b>.</p>
<p></p>
<p>The dashpot has a <b>viscosity</b> $$\\gamma$$. And its force does not depend on the displacement, but on the first derivative of
its displacement, the <b>velocity</b> $$v$$.</p>
<p>How does the force depend on the <b>viscosity</b> $$\\gamma$$ and the <b>velocity</b> $$v$$?</p>
            `;
        this.test_cases = [{
            "name": "Dashpot (gamma = 1 Ns/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Dashpot", 0, 1, 1, 1]],
            "input": ["Displacement", "Ramp", 1, 0, 1]
        },
            {
                "name": "Dashpot (gamma = 0.5 Ns/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Dashpot", 0, 1, 0.5, 1]],
                "input": ["Displacement", "Ramp", 1, 0, 1]
            }
        ];
        this.text_finshed = `
<p>The force of a <b>dashpot</b> is proportional to the <b>velocity</b> with the proportionality constant $$\\gamma$$.</p>
\\[F = \\gamma \\cdot v \\]
        `;

        this.text_allowed_elements = `Use the velocity $$v$$, the viscosity $$gamma$$,`;
    }

    allowed_elements (sim, index) {
        return {
            gamma : sim.elements[0].strength,
            t: sim.times[index],
            F: sim.dataF[index],
            v: sim.dataF[index]/sim.elements[0].strength,
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("gamma", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("v", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Dashpot", 0, 1, 1, 1]],
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
