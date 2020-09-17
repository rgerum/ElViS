class QuestionSeriesSpring extends Question {
    constructor() {
        super();
        this.title = "Effective Spring Constant for Serial Arrangements";
        this.text = `

<p>Finally, we will take a look at how the <b>spring constants</b> of <b>serial</b> elements contribute to a total spring constant.</p>
<p>For simplicity we use two springs with <b>the same</b> spring constant $$k$$ ($$k1=k2=k$$).</p>
<p>How does the <b>total force</b> of the two springs depend on the <b>spring constants</b> and the <b>total displacement</b> $$d$$?</p>
            `;
        this.test_cases = [{
            "name": "Spring (k1 = 1 N/m, k2 = 1 N/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Spring stiff (k1 = 2 N/m, k2 = 2 N/m)",
                "plot_point": 2,
                "points": [[0, 0], [1, 1], [1,2]],
                "elements": [["Spring", 0, 1, 2, 1], ["Spring", 1, 2, 2, 1]],
                "input": ["Displacement", "Ramp", 1, 0, 1]
            }
        ];
        this.text_finshed = `
<p>Great! The spring constant of <b>two equal springs</b> in <b>series</b> is <b>half</b> the spring constant of each spring.</p>
\\[k_\\mathrm{total} = \\frac{k_1}{2} = \\frac{k_2}{2} \\]
<p>In general, the spring constants for arbitrary springs in series <b>add up reciprocally</b>.</p>
\\[\\frac{1}{k_\\mathrm{total}} = \\frac{1}{k_1} + \\frac{1}{k_2} + \\frac{1}{k_3} + \\ldots\\]
        `;

        this.text_allowed_elements = `Use the total displacement $$d$$, the spring constant $$k$$,`;
    }

    allowed_elements (sim, index) {
        let k1 = sim.elements[0].strength;
        let k2 = sim.elements[0].strength;
        let k = k1;//1/(1/k1+1/k2);
        return {
            k : k,
            t: sim.times[index],
/*            F: sim.dataF[index],*/
            d: sim.data[index],
            k1: k1,
            k2: k2,
/*            F1: sim.dataF[index],
            F2: sim.dataF[index],*/
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("k", v=>this.sim.elements[0].strength = this.sim.elements[1].strength = v, this.updateSim.bind(this));
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
        let slider = addSlider(this);
    }
}
