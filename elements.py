# -*- coding: utf-8 -*-
"""
ElViS Simulator

ELastic-VIscous-System Simulator

"""
import numpy as np

class Element:
    start = 0
    end = 0
    drawoffset = 0

    def __init__(self, start, end=0, **kwargs):
        self.start = start
        self.end = end
        for key in kwargs:
            setattr(self, key, kwargs[key])

    def draw(self):
        pass

    def eval(self, X, Y, index, direction, fGetY):
        pass

    def targets(self):
        return [self.start, self.end]

    def __repr__(self):
        my_class = self.__class__
        attributes = [name for name in dir(my_class) if
         name[0] != "_" and not callable(getattr(my_class, name)) and not name in ["start", "end"]]
        params = []
        for target in self.targets():
            params.append("%d" % target)
        for name in attributes:
            params.append("%s=%s" % (name, str(getattr(self, name))))
        return "%s(%s)" % (my_class.__name__, ", ".join(params))

    def eval_raw(self, X, Y, index, direction, fGetY):
        pos1 = np.array(Y[self.start * 4 + 0: self.start * 4 + 4: 2])
        vel1 = np.array(Y[self.start * 4 + 1: self.start * 4 + 4: 2])

        pos2 = np.array(Y[self.end * 4 + 0: self.end * 4 + 4: 2])
        vel2 = np.array(Y[self.end * 4 + 1: self.end * 4 + 4: 2])

        return self.eval(X, pos1, pos2, vel1, vel2, index, direction)[fGetY]

    def eval(self):
        pass


class Spring(Element):
    rest = 1
    strength = 1

    def draw(self, subplot, start, end):
        # difference vector
        dist = end-start
        # normalized normal vector
        norm = np.array([-dist[1], dist[0]]) / np.linalg.norm(dist)

        # pos with gather all points
        pos = start
        # the count of the coil
        count = int(self.rest / 0.1)
        # iterate over them
        for i in range(count):
            # and add a point
            pos = np.vstack((pos, start + dist * (i+0.5)/count + norm * ((i%2)*2-1) * 0.1 + norm * self.drawoffset))
        # add the end point
        pos = np.vstack((pos, end))
        # plot the spring
        subplot.plot(pos[:, 0], pos[:, 1], 'g-')

    def eval(self, t, pos1, pos2, vel1, vel2, index, direction):
        # the difference between the two anchor points
        diff = pos2-pos1
        # calculate the length
        length = np.linalg.norm(diff)
        # the force magnitude is x*k
        factor = (length - self.rest) * self.strength
        # the direction is the normalized difference vector multiplied by the "direction" (-1 or 1, depending which point is start or end)
        vector = diff / length * direction
        return vector * factor

    def __str__(self):
        return "%d-%d Spring" % (self.start, self.end)

class WLCSpring(Spring):
    def eval(self, t, pos1, pos2, vel1, vel2, index, direction):
        diff = pos2 - pos1
        length = np.linalg.norm(diff)
        factor = (1. / (4 * (1 - length / self.rest) ** 2) - 1 / 4 + length / self.rest) * self.strength
        vector = diff / length * direction
        return vector * factor

    def __str__(self):
        return "%d-%d WLCSpring" % (self.start, self.end)

class Viscous(Element):
    strength = 1

    def draw(self, subplot, start, end):
        width = 0.1
        start_dist = 0.2
        end_dist = 0.2
        hole_dist = 0.4

        # difference vector
        dist = end - start
        # normalized normal vector
        norm = np.array([-dist[1], dist[0]]) / np.linalg.norm(dist)
        # normalized tangential vector
        tan = dist / np.linalg.norm(dist)

        # start at the first position
        pos = start
        # iterate over both parts of the sheath
        for dir in [-1, 1]:
            # start at the middle
            pos = np.vstack((pos, start + tan * start_dist + norm * self.drawoffset))
            # go up
            pos = np.vstack((pos, start + tan * start_dist + norm * (dir*width + self.drawoffset)))
            # and along the damper
            pos = np.vstack((pos, start + dist - tan * end_dist + norm * (dir*width + self.drawoffset), [[np.nan, np.nan]]))
        # the middle part of the damper
        pos = np.vstack((pos, start + tan * hole_dist + norm * self.drawoffset))
        pos = np.vstack((pos, start + dist - tan * start_dist + norm * self.drawoffset))
        pos = np.vstack((pos, end))
        # plot the damper
        subplot.plot(pos[:, 0], pos[:, 1], 'g-')

    def eval(self, t, pos1, pos2, vel1, vel2, index, direction):
        # the difference vectors of the positions and the velocities
        diff = pos2-pos1
        rel_v = vel2 - vel1
        # length and normed difference vector
        length = np.linalg.norm(diff)
        diff_normed = diff / length
        # get the parallel component of the velocity
        v_parallel = np.dot(rel_v, diff_normed)
        # the force is v*k
        factor = v_parallel * self.strength
        vector = diff_normed * direction
        return vector * factor

    def __str__(self):
        return "%d-%d Viscous" % (self.start, self.end)

class Force(Element):
    t_start = 0
    t_end = 10
    strength_x = 1
    strength_y = 0

    def draw(self, subplot, start, end):
        # difference vector
        dist = np.array([self.strength_x, self.strength_y])
        end = start + dist
        # normalized normal vector
        norm = np.array([-dist[1], dist[0]]) / np.linalg.norm(dist)
        # normalized tangential vector
        tan = dist / np.linalg.norm(dist)

        pos = start
        for dir in [-1, 1]:
            pos = np.vstack((pos, end, end + dir * norm * 0.1 - tan * 0.2, [[np.nan, np.nan]]))
        # plot the force arrow
        subplot.plot(pos[:, 0], pos[:, 1], 'r-')

    def eval(self, t, pos1, pos2, vel1, vel2, index, direction):
        # the force is only active for times between t_start and t_end
        if self.t_start <= t < self.t_end:
                return [self.strength_x, self.strength_y]
        return [0, 0]

    def __str__(self):
        return "%d Force" % (self.start)

    def targets(self):
        return [self.start]

class SinForce(Force):
    def eval(self, t, pos1, pos2, vel1, vel2, index, direction):
        # the force is only active for times between t_start and t_end
        if self.t_start <= t < self.t_end:
            return np.array([self.strength_x, self.strength_y]) * np.cos(t * 2 * np.pi)
        return [0, 0]


class ForceGenerator(Element):
    strength = 1
    t_start = 0
    t_end = 10

    def draw(self, subplot, start, end):
        # difference vector
        diff = end - start
        # normalized normal vector
        norm = np.array([-diff[1], diff[0]]) / np.linalg.norm(diff)
        # normalized tangential vector
        tan = diff / np.linalg.norm(diff)

        pos = start
        for dir in [-1, 1]:
            pos = np.vstack((pos, start + 0.5*diff, start+0.5*diff + dir * norm * 0.1 - tan * 0.2, [[np.nan, np.nan]]))
        pos = np.vstack((pos, end))
        for dir in [-1, 1]:
            pos = np.vstack((pos, end - 0.5*diff, end - 0.5*diff + dir * norm * 0.1 + tan * 0.2, [[np.nan, np.nan]]))
        # plot the force arrow
        subplot.plot(pos[:, 0], pos[:, 1], 'r-')

    def eval(self, t, pos1, pos2, vel1, vel2, index, direction):
        # the force is only active for times between t_start and t_end
        if self.t_start <= t < self.t_end:
            # the difference between the two anchor points
            diff = pos2-pos1
            # calculate the length
            length = np.linalg.norm(diff)
            # the force magnitude is defined by the strength
            factor = self.strength
            # the direction is the normalized difference vector multiplied by the "direction" (-1 or 1, depending which point is start or end)
            vector = diff / length * direction
            return vector * factor
        return [0, 0]

    def __str__(self):
        return "%d-%d ForceGenerator" % (self.start, self.end)