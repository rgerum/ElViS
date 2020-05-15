class Spring {
    constructor(start, end, strength, rest) {
        this.start = start;
        this.end = end;
        this.strength = strength;
        this.rest = rest;
        this.target_ids = [this.start, this.end];

        this.drawoffset = 0;
    }
    init(points) {
        let [start, end] = points;
        let dist = math.subtract(end, start);
        this.rest = math.norm(dist);
    }

    draw(points) {
        let start_dist = 0.2
        let end_dist = 0.2

        let [start, end] = points;
        // difference vector
        let dist = math.subtract(end, start);
        // ignore 0 elements
        if(math.norm(dist) === 0)
            return "x";
        // normalized normal vector
        let norm = math.divide([-dist[1], dist[0]], math.norm(dist))
        let tang = math.divide(dist, math.norm(dist))

        // pos with gather all points
        let pos = [start]
        // add the start point with offset
        pos.push(math.add(start, math.multiply(norm, this.drawoffset)))
        pos.push(math.add(start, math.multiply(tang, start_dist), math.multiply(norm, this.drawoffset)))
        let rect = {x: start[0], width:math.norm(dist), y: this.drawoffset-0.2, height: 0.4};

        // the count of the coil
        let count = parseInt(Math.abs(this.rest) / 0.1)
        // iterate over them
        if(this.strength != 0) {
            for (let i = 0; i < count; i++) {
                // and add a point
                let p_dist = math.multiply(tang, start_dist + (i + 0.5) / count * (math.norm(dist) - start_dist - end_dist));
                let p_norm = math.multiply(norm, ((i % 2) * 2 - 1) * 0.1);
                let p_offset = math.multiply(norm, this.drawoffset);
                let p = math.add(start, p_dist, p_norm, p_offset);
                pos.push(p);
                //pos.push([start + dist * (i+0.5)/count + norm * ((i%2)*2-1) * 0.1 + norm * self.drawoffset])
            }
        }
        pos.push(math.add(start, math.multiply(tang, math.norm(dist)-end_dist), math.multiply(norm, this.drawoffset)))
        // add the end point
        pos.push(math.add(end, math.multiply(norm, this.drawoffset)));
        pos.push(end);
        // plot the spring
        //subplot.plot(pos[:, 0], pos[:, 1], 'g-')
        return {rect:rect, lines: [pos]};
    }

    eval(t) {
        if(this.start == this.end)
            return [ [0], [[0,0],[0,0]], [[0,0],[0,0]]]
        let F = [-this.rest*this.strength, this.rest*this.strength]
        let Fx = [[-this.strength, this.strength], [this.strength, -this.strength]]
        let Fv = [[0, 0], [0, 0]]
        return [F, Fx, Fv]
    }
}

class Dashpot {
    constructor(start, end, strength, rest) {
        this.start = start;
        this.end = end;
        this.strength = strength;
        this.rest = rest;
        this.target_ids = [this.start, this.end];
        this.drawoffset = 0;
    }
    init(points) {
    }
    draw(points, t) {
        let [start, end] = points;
        let width = 0.1
        let start_dist = 0.2
        let end_dist = 0.2
        let hole_dist = 0.4

        // difference vector
        let dist = math.subtract(end, start);
        // ignore 0 elements
        if(math.norm(dist) === 0)
            return
        // normalized normal vector
        let norm = math.divide([-dist[1], dist[0]], math.norm(dist))
        // normalized tangential vector
        let tan = math.divide(dist, math.norm(dist))

        // start at the first position
        let lines = []
        let pos = [start]
        pos.push(math.add(start, math.multiply(norm, this.drawoffset)))
        let rect = {x: start[0], width:math.norm(dist), y: this.drawoffset-0.2, height: 0.4};

        // iterate over both parts of the sheath
        if(this.strength != 0) {
            for (let dir of [-1, 1]) {
                // start at the middle
                pos.push(math.add(start, math.multiply(tan, start_dist), math.multiply(norm, this.drawoffset)));
                // go up
                pos.push(math.add(start, math.multiply(tan, start_dist), math.multiply(norm, (dir * width + this.drawoffset))));
                // and along the damper
                pos.push(math.add(start, dist, math.multiply(tan, -end_dist), math.multiply(norm, dir * width + this.drawoffset)));
                lines.push(pos);
                pos = [];
            }
        }
        // the middle part of the damper
        pos.push(math.add(start, math.multiply(tan, hole_dist), math.multiply(norm, this.drawoffset)))
        pos.push(math.add(start, dist, math.multiply(tan, -start_dist), math.multiply(norm, this.drawoffset)))
        pos.push(math.add(end, math.multiply(norm, this.drawoffset)))
        pos.push(end);
        lines.push(pos);
        return {rect: rect, lines:lines};
    }

    eval(t) {
        if(this.start == this.end)
            return [[0, 0], [[0,0],[0,0]], [[0,0],[0,0]]]
        let F = [0, 0]
        let Fx = [[0, 0], [0, 0]]
        let Fv = [[-this.strength, this.strength], [this.strength, -this.strength]]
        return [F, Fx, Fv]
    }
}

class Force {
    constructor(start, strength, t_start, t_end) {
        this.start = start;
        this.strength = strength;
        this.t_start = t_start;
        this.t_end = t_end;
        this.target_ids = [this.start]
    }
    init(points) {}

    draw(points, t) {
        if(!!t && !(this.t_start <= t && t < this.t_end))
            return {rect: {x:0,y:0,width:0, height: 0}, lines: []};
        let start = points[0];
        // difference vector
        let dist = [this.strength, 0];
        let end = math.add(start, dist);
        // normalized normal vector
        let norm = math.divide([-dist[1], dist[0]], math.norm(dist));
        // normalized tangential vector
        let tan = math.divide(dist, math.norm(dist));
        let rect = {x: start[0], width:math.norm(dist), y: this.drawoffset-0.2, height: 0.4};

        let lines = [];
        let pos = [start];
        for(let dir of [-1, 1]) {
            pos.push(end);
            pos.push(math.add(end, math.multiply(norm, dir * 0.1), math.multiply(tan,-0.2)));
            lines.push(pos);
        }
        return {rect:rect, lines:lines};
    }

    eval(t) {
        let F = [0];
        if(this.t_start <= t && t < this.t_end)
            F = [this.strength];
        let Fx = [[0]];
        let Fy = [[0]];
        return [F, Fx, Fy]
    }
}

function zeros(N, M) {
    if(M === undefined) {
        let F = [];
        for (let i = 0; i < N; i++) {
            F.push(0);
        }
        return F;
    }
    let F = [];
    for (let i = 0; i < N; i++) {
        let f = [];
        for (let j = 0; j < M; j++)
            f.push(0);
        F.push(f);
    }
    return F;
}

function mul(M, v, i) {
    let res = []
    for(let x = 0; x < M.length; x++) {
        let sum = 0;
        for(let y = 0; y < M[x].length; y++) {
            if(i[y])
                sum += M[x][y] * v[y];
        }
        res.push(sum);
    }
    return res;
}

function getElement(name, parames) {
    if(name === "Spring")
        return new Spring(parames[1], parames[2], parames[3], parames[4]);
    if(name === "Dashpot")
        return new Dashpot(parames[1], parames[2], parames[3]);
    if(name === "Force")
        return new Force(parames[1], parames[2], parames[3], parames[4]);
}

class System {
    constructor() {
        this.points = [[0, 0], [1, 1]];
        this.elements =
        [
            new Spring(0, 1, 1, 1),
            new Dashpot(0, 1, 1),
        ];
        this.external =
        [
            new Force(1, 1, 1, 3)
        ];
        this.end_time = 10;
        this.h = 0.1;

        this.plot_point = 1;
    }

    setData(data) {
        this.plot_point = data.plot_point
        this.points_trajectory = undefined
        this.points = data.points;

        this.elements = [];
        for(let element of data.elements) {
            //let name = element.splice(0, 1)[0];
            this.elements.push(getElement(element[0], element));
        }
        this.updateDrawOffsets();
    }

    updateDrawOffsets() {
        let element_count = zeros(this.points.length);
        for(let element of this.elements) {
            let point = d3.min(element.target_ids);
            element.drawoffset = element_count[point] / 2;
            element_count[point] += 1;
        }
        for(let element of this.elements) {
            let point = d3.min(element.target_ids);
            element.drawoffset -= (element_count[point] - 1) / 4;
        }
    }

    get_points(i) {
        if(i === 0 || i == undefined)
            return this.points;
        let p = [];
        for(let j in this.points) {
            p.push([this.points[j][0], this.points_trajectory[i][j]])
        }
        return p;
    }

    draw(i) {
        let elements = [];
        let points = this.get_points(i);
        for(let element of this.elements) {
            let p = [];
            for(let i of element.target_ids) {
                p.push([points[i][1], 0]);
            }
            elements.push(element.draw(p, i*this.h));
        }
        return elements;
    }

    drawForces(i) {
        let elements = [];
        let points = this.get_points(i);
        for(let element of this.external) {
            let p = [];
            for(let i of element.target_ids) {
                p.push([points[i][1], 0]);
            }
            elements.push(element.draw(p, i*this.h));
        }
        return elements;
    }

    simulateOverdamped() {
        let points = this.get_points();
        for(let element of this.elements) {
            let p = [];
            for(let i of element.target_ids) {
                p.push([points[i][1], 0]);
            }
            element.init(p);
        }
        this.external[0].start = this.plot_point;
        this.external[0].target_ids[0] = this.plot_point;

        this.points_trajectory = [];
        this.times = [0];

        let N = this.points.length;

        let free = [];
        let fixed = []
        let p = [];
        let p_old = []
        for(let point of this.points) {
            p.push(point[1]);
            p_old.push(point[1]);
            free.push(point[0]);
            fixed.push(1-point[0]);
        }
        this.points_trajectory.push(p);
        for(let t = this.h; t < this.end_time; t += this.h) {
            for(let i = 0; i < N; i++)
                p_old[i] = p[i];

            let F = zeros(N);
            let Fx = zeros(N, N);
            let Fv = zeros(N, N);

            for(let group of [this.elements, this.external]) {
                for (let element of group) {
                    let [F_node, Fx_node, Fv_node] = element.eval(t);
                    for (let i in element.target_ids) {
                        F[element.target_ids[i]] += F_node[i];
                        for (let j in element.target_ids) {
                            Fx[element.target_ids[i]][element.target_ids[j]] += Fx_node[i][j];
                            Fv[element.target_ids[i]][element.target_ids[j]] += Fv_node[i][j] / this.h;
                        }
                    }
                }
            }

            let Fxv = math.add(Fx, Fv);
            for(let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    if(fixed[j])
                        Fxv[i][j] = (i === j)*1
                }
            }
            let Fxv_inv = math.inv(Fxv);

            let Fv_p = mul(Fv, p_old, free);

            let Fx_p = mul(Fx, p, fixed);
            let right = math.subtract(math.subtract(Fv_p, Fx_p), F);
            let x = math.multiply(Fxv_inv, right);

            let p2 = [];
            for(let i = 0; i < N; i++)
                p2.push(free[i] ? x[i] : p[i])
            p = p2;
            this.points_trajectory.push(p);
            this.times.push(t);
        }
        this.data = this.points_trajectory.map(x=>x[this.plot_point]);
    }
}