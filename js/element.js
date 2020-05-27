class Spring {
    constructor(start, end, strength, rest) {
        this.strength = strength;
        this.rest = rest;
        this.target_ids = [start, end];

        this.drawoffset = 0;
    }
    init(points) {
        let [start, end] = points;
        let dist = math.subtract(end, start);
        this.rest = math.norm(dist);
    }

    draw(points) {
        let start_dist = 0.2
        let start_dist1 = 0.1
        let end_dist = 0.2
        let end_dist1 = 0.1

        let [start, end] = points;
        // difference vector
        let dist = math.subtract(end, start);
        // ignore 0 elements
        //if(math.norm(dist) === 0)
        // normalized normal vector
        let norm = math.divide([-dist[1], dist[0]], math.norm(dist))
        let tang = math.divide(dist, math.norm(dist))

        // pos with gather all points
        let pos = [start]
        pos.push(math.add(start, math.multiply(tang, start_dist1)))
        // add the start point with offset
        pos.push(math.add(start, math.multiply(tang, start_dist1), math.multiply(norm, this.drawoffset)))
        pos.push(math.add(start, math.multiply(tang, start_dist), math.multiply(norm, this.drawoffset)))
        let rect = {x: start[0], width:math.norm(dist), y: this.drawoffset-0.2, height: 0.4};
        let rect_start = {x: start[0], width:start_dist, y: this.drawoffset-0.2, height: 0.4};
        let rect_end = {x: end[0]-end_dist, width:end_dist, y: this.drawoffset-0.2, height: 0.4};

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
        pos.push(math.add(end, math.multiply(tang, -end_dist1), math.multiply(norm, this.drawoffset)));
        pos.push(math.add(end, math.multiply(tang, -end_dist1)));
        pos.push(end);
        // plot the spring
        //subplot.plot(pos[:, 0], pos[:, 1], 'g-')
        return {rect:rect, rect_start: rect_start, rect_end: rect_end, lines: [pos]};
    }

    eval(t) {
        if(this.target_ids[0] == this.target_ids[1])
            return [ [0], [[0,0],[0,0]], [[0,0],[0,0]]]
        let F = [-this.rest*this.strength, this.rest*this.strength]
        let Fx = [[-this.strength, this.strength], [this.strength, -this.strength]]
        let Fv = [[0, 0], [0, 0]]
        return [F, Fx, Fv]
    }
}

class Dashpot {
    constructor(start, end, strength, rest) {
        this.strength = strength;
        this.rest = rest;
        this.target_ids = [start, end];
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

        let start_dist1 = 0.1
        let end_dist1 = 0.1


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
        pos.push(math.add(start, math.multiply(tan, start_dist1)))
        // add the start point with offset
        pos.push(math.add(start, math.multiply(tan, start_dist1), math.multiply(norm, this.drawoffset)))
        let rect = {x: start[0], width:math.norm(dist), y: this.drawoffset-0.2, height: 0.4};
        let rect_start = {x: start[0], width:start_dist, y: this.drawoffset-0.2, height: 0.4};
        let rect_end = {x: end[0]-end_dist, width:end_dist, y: this.drawoffset-0.2, height: 0.4};

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

        pos.push(math.add(end, math.multiply(tan, -end_dist1), math.multiply(norm, this.drawoffset)));
        pos.push(math.add(end, math.multiply(tan, -end_dist1)));
        pos.push(end);
        lines.push(pos);
        return {rect:rect, rect_start: rect_start, rect_end: rect_end, lines: lines};
    }

    eval(t) {
        if(this.target_ids[0] == this.target_ids[1])
            return [[0, 0], [[0,0],[0,0]], [[0,0],[0,0]]]
        let F = [0, 0]
        let Fx = [[0, 0], [0, 0]]
        let Fv = [[-this.strength, this.strength], [this.strength, -this.strength]]
        return [F, Fx, Fv]
    }
}

class ForceGenerator {
    constructor(start, end, strength) {
        this.strength = strength;
        this.t_start = 0;
        this.t_end = 1;
        this.target_ids = [start, end];
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

        let start_dist1 = 0.1
        let end_dist1 = 0.1

        let radius = 0.2

        // difference vector
        let dist = math.subtract(end, start);
        // ignore 0 elements
        if(math.norm(dist) === 0)
            return

        start_dist = (math.norm(dist)/2 - radius)
        end_dist = (math.norm(dist)/2 - radius)
        console.log(math.norm(dist), radius, start_dist)

        // normalized normal vector
        let norm = math.divide([-dist[1], dist[0]], math.norm(dist))
        // normalized tangential vector
        let tan = math.divide(dist, math.norm(dist))

        // start at the first position
        let lines = []
        let pos = [start]
        pos.push(math.add(start, math.multiply(tan, start_dist1)))
        // add the start point with offset
        pos.push(math.add(start, math.multiply(tan, start_dist1), math.multiply(norm, this.drawoffset)))
        pos.push(math.add(start, math.multiply(tan, start_dist), math.multiply(norm, this.drawoffset)))
        let rect = {x: start[0], width:math.norm(dist), y: this.drawoffset-0.2, height: 0.4};
        let rect_start = {x: start[0], width:start_dist, y: this.drawoffset-0.2, height: 0.4};
        let rect_end = {x: end[0]-end_dist, width:end_dist, y: this.drawoffset-0.2, height: 0.4};

        // the middle part of the damper
        //pos.push(math.add(start, math.multiply(tan, hole_dist), math.multiply(norm, this.drawoffset)))
        //pos.push(math.add(start, dist, math.multiply(tan, -start_dist), math.multiply(norm, this.drawoffset)))
        lines.push(pos)

        pos = []
        for(let i=0; i < 360; i++)
            pos.push(math.add(start, math.multiply(tan, math.norm(dist)/2), math.multiply(norm, this.drawoffset),
            [-Math.cos(i/180*Math.PI)*radius, Math.sin(i/180*Math.PI)*radius]))
        lines.push(pos)

        pos = []
        pos.push(math.add(end, math.multiply(tan, -end_dist), math.multiply(norm, this.drawoffset)));
        pos.push(math.add(end, math.multiply(tan, -end_dist1), math.multiply(norm, this.drawoffset)));
        pos.push(math.add(end, math.multiply(tan, -end_dist1)));
        pos.push(end);
        lines.push(pos);
        return {rect:rect, rect_start: rect_start, rect_end: rect_end, lines: lines};
    }

    eval(t) {
        if(this.target_ids[0] == this.target_ids[1])
            return [[0, 0], [[0,0],[0,0]], [[0,0],[0,0]]]
        let F = [0, 0]
        if(this.t_start <= t && t < this.t_end)
            F = [this.strength, -this.strength];
        let Fx = [[0, 0], [0, 0]]
        let Fv = [[0, 0], [0, 0]]
        return [F, Fx, Fv]
    }
}

class Force {
    constructor(start, strength, t_start, t_end) {
        this.strength = strength;
        this.t_start = t_start;
        this.t_end = t_end;
        this.target_ids = [start]
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

    eval(t, p, p0) {
        let F = [0];
        if(this.t_start <= t && t < this.t_end)
            F = [this.strength];
        let Fx = [[0]];
        let Fy = [[0]];
        return [F, Fx, Fy]
    }
}

class Displacement {
    constructor(start, strength, t_start, t_end) {
        this.strength = strength;
        this.t_start = t_start;
        this.t_end = t_end;
        this.target_ids = [start]
    }
    init(points) {}

    draw(points, t) {
        return {rect: {x:0,y:0,width:0, height: 0}, lines: []};
    }

    eval(t, p, p0) {
        let F = [0];
        if(this.t_start <= t && t < this.t_end)
            p[this.target_ids[0]] = p0[this.target_ids[0]][1] + this.strength;
        else
            p[this.target_ids[0]] = p0[this.target_ids[0]][1];
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
        ];
        this.external =
        [
            new Force(1, 1, 0, 1)
        ];
        this.start_time = -1;
        this.end_time = 5;
        this.h = 0.01;

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
        let element_index = zeros(this.elements.length);

        for(let element of this.elements) {
            let max = 0;
            for(let j=element.target_ids[0]; j < element.target_ids[1]; j++)
            {
                if(element_count[j] > max)
                    max = element_count[j];
            }
            for(let j=element.target_ids[0]; j < element.target_ids[1]; j++)
            {
                element_count[j] += 1;
            }
            element.drawoffset = max / 2;
        }
        for(let element of this.elements) {
            let max = 0;
            for(let j=element.target_ids[0]; j < element.target_ids[1]; j++)
            {
                if(element_count[j] > max)
                    max = element_count[j];
            }
            element.drawoffset -= (max - 1) / 4;
        }
    }

    insertPoint(i) {
        this.points.splice(i, 0, [1, i, 0]);

        for(let element of this.elements) {
            for(let j in element.target_ids)
                if(element.target_ids[j] >= i)
                    element.target_ids[j] += 1;
        }
        if(this.plot_point >= i)
            this.plot_point += 1;
        for(let i in this.points)
            this.points[i][1] = i;
    }

    removeUnusedPoints() {
        let usage_count = [];
        for(let i in this.points)
            usage_count.push(0);
        for(let element of this.elements) {
            for(let j in element.target_ids)
                usage_count[element.target_ids[j]] += 1;
        }
        for(let i = this.points.length-1; i >= 0; i--) {
            if(usage_count[i] == 0) {
                this.points.splice(i, 1);
                for(let element of this.elements) {
                    for(let j in element.target_ids)
                        if(element.target_ids[j] >= i)
                            element.target_ids[j] -= 1;
                }
                if(this.plot_point >= i)
                    this.plot_point -= 1;
            }
        }
        for(let i in this.points)
            this.points[i][1] = 1*i;
        this.plot_point = this.points.length - 1;

        // remove 0 length elements
        for(let i = this.elements.length-1; i >= 0; i--) {
            if(this.elements[i].target_ids[0] === this.elements[i].target_ids[1])
                this.elements.splice(i, 1);
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
        this.external[0].target_ids[0] = this.plot_point;
        if(this.external[0].constructor.name == "Force")
            this.points[this.plot_point][0] = 1;
        else
            this.points[this.plot_point][0] = 0;
        for(let i = 1; i < this.points.length-1; i++)
            this.points[i][0] = 1;

        let points = this.get_points();
        for(let element of this.elements) {
            let p = [];
            for(let i of element.target_ids) {
                p.push([points[i][1], 0]);
            }
            element.init(p);
        }

        this.points_trajectory = [];
        this.points_force_trajectory = [];
        this.times = [this.start_time];

        let N = this.points.length;

        let free = [];
        let fixed = []
        let p = [];
        let f = [];
        let p_old = []
        for(let point of this.points) {
            p.push(point[1]);
            f.push(0)
            p_old.push(point[1]);
            free.push(point[0]);
            fixed.push(1-point[0]);
        }
        this.points_trajectory.push(p);
        this.points_force_trajectory.push(f);
        for(let t = this.start_time+this.h; t < this.end_time; t += this.h) {
            for(let i = 0; i < N; i++)
                p_old[i] = p[i];

            let F = zeros(N);
            let Fx = zeros(N, N);
            let Fv = zeros(N, N);

            for(let group of [this.elements, this.external]) {
                for (let element of group) {
                    let [F_node, Fx_node, Fv_node] = element.eval(t, p, this.points);
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

            let Fv_p = math.multiply(Fv, p_old);

            let Fx_p = mul(math.add(Fx, Fv), p, fixed);
            let right = math.subtract(math.subtract(Fv_p, Fx_p), F);
            let x = math.multiply(Fxv_inv, right);

            let p2 = [];
            let f2 = [];
            for(let i = 0; i < N; i++) {
                p2.push(free[i] ? x[i] : p[i])
                f2.push(free[i] ? 0 : x[i])
            }
            p = p2;
            f = f2;
            if(this.points[this.plot_point][0] == 1) {
                let [F_node, Fx_node, Fv_node] = this.external[0].eval(t, p, this.points);
                f2[this.plot_point] = F_node[0];
            }
            this.points_trajectory.push(p);
            this.points_force_trajectory.push(f);
            this.times.push(t);
        }
        this.data = this.points_trajectory.map(x=>x[this.plot_point]-this.points[this.plot_point][1]);
        this.dataF = this.points_force_trajectory.map(x=>x[this.plot_point]);
    }
}