class QuestionOneSpring extends Question {
    constructor() {
        super();
        this.title = "Single Spring";
        this.text = `
<p>The first element we need to build visco-elastic systems is the <b>spring</b>, the elastic element.</p>
<p>In the <b>virtual lab</b>, you can experiment with a spring. Change the <b>spring constant $$k$$</b> and stretch the spring by a <b>length $$d$$</b>.</p>
 
<p>Observe the output <b>force $$F$$</b> and derive an equation connecting $$F$$, $$k$$ and $$d$$.</p>
<p>What is the force $$F$$ generated by a spring with <b>spring constant</b> $$k$$ when it is <b>stretched</b> by a length $$d$$?</p>
`;
        this.test_cases = [{
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Spring stiff (k = 2 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 2, 1]],
                "input": ["Displacement", "Rectangle", 1, 0, 2]
            },
            {
                "name": "Spring soft (k = 0.5 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 0.5, 1]],
                "input": ["Displacement", "Rectangle", 1, 0, 1]
            },
            {
                "name": "Ramp (k = 1 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 1, 1]],
                "input": ["Displacement", "Ramp", 1, 0, 1]
            }
        ];
        this.text_finshed = `
        <p>           Great, you have learned that the force increases <b>proportionally</b> with elongation. The factor of proportionality is the spring constant $$k$$.</p>
\\[F = k\\cdot d\\]
<p>This relationship is called <b>Hooke's law</b>.</p>
        `;

        this.text_allowed_elements = `Use the spring constant \\(k\\), the displacement \\(d\\),`;
    }

    allowed_elements (sim, index) {
        return {
            t: sim.times[index],
            F: sim.dataF[index],
            k: sim.elements[0].strength,
            d: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point])
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("k", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("d", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1]],
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
