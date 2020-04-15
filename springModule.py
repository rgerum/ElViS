# -*- coding: utf-8 -*-
"""
ElViS Simulator

ELastic-VIscous-System Simulator

"""
import numpy as np
from elements import Spring, Viscous, Force

POINT_static = 0
POINT_dynamic = 1


class MySim:
    big_point_array = None

    def __init__(self):
        # initialize the empty lists
        self.point_definitions = []

        self.points = []
        self.point_types = []
        self.all_points = []
        self.elements = []

        if 0:
            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 1, 0)
            #self.add_point(POINT_dynamic, 2, 0)
            #self.add_point(POINT_dynamic, 3, 0)
            self.add_point(POINT_static, 4, 0)

            # add initial elements
            self.add_element(Spring(0, 1, rest=1, strength=1))
            self.add_element(Viscous(0, 1, strength=1))
            self.add_element(Force(1, strength_x=1, t_start=1, t_end=3))
        else:

            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 1, 0)
            self.add_point(POINT_dynamic, 2, 0)

            # add initial elements
            self.add_element(Spring(0, 2, r=2, strength=1, drawoffset=0.5))
            self.add_element(Viscous(0, 2, rest=2, strength=1, drawoffset=-0.5))
            self.add_element(Force(2, strength_x=1, t_start=1, t_end=3))

        # set the end time and the time step
        self.end_time = 10
        self.h = 0.01
        self.gamma = 0.01
        self.m = 0.01

    def serialize(self):
        text = "points = "
        points = []
        for i in range(len(self.point_types)):
            points.append("[%d, %s, %s]" % (self.point_types[i], self.points[i*2], self.points[i*2+1]))
        text += "["+", ".join(points)+"]"
        text += "\n"
        text += "elements = [%s]" % ", ".join([repr(e) for e in self.elements])
        return text

    def deserialize(self, text):
        for line in text.split("\n"):
            line = line.strip()
            if line.startswith("points = "):
                line = line[len("points = "):].strip()
                points = eval(line)
                for point in points:
                    self.add_point(*point)
            if line.startswith("elements = "):
                line = line[len("elements = "):].strip()
                self.elements = eval(line)

    def add_element(self, element):
        # add an element to the list of elements
        self.elements.append(element)

    def add_point(self, type, x, y):
        if self.big_point_array is None:
            self.big_point_array = np.zeros([1, 0, 2, 2])
            self.big_point_array_movable = np.zeros([0])
        self.point_definitions.append([type, x, y])
        # add a point to the list of points
        self.points.append(x + .0)
        self.points.append(0)
        self.points.append(y + .0)
        self.points.append(0)
        self.point_types.append(type)
        self.big_point_array = np.concatenate((self.big_point_array, [[[[x, y], [0, 0]]]]), axis=1)
        self.big_point_array_movable = np.concatenate((self.big_point_array_movable, [type == POINT_dynamic]))

    def createPointArray(self):
        self.N = len(self.point_definitions)
        times = np.arange(0, self.end_time, self.h)
        self.times = times

        self.big_point_array = np.zeros([len(times), self.N, 2, 2])
        self.big_point_array_movable = np.zeros([self.N], dtype=np.bool)
        for index, point in enumerate(self.point_definitions):
            self.big_point_array[0, index, 0, :] = point[1:3]
            self.big_point_array_movable[index] = point[0]

        # fixed points stay the same at all times
        self.big_point_array[:, ~self.big_point_array_movable, 0, :] = self.big_point_array[0, ~self.big_point_array_movable, 0, :]

        def o(a):
            return repr(a).replace("\n", "").replace("  ", " ").replace("  ", " ")

        force = np.zeros([self.N, 2])
        diff = np.zeros([self.N, 2, 2])
        p = self.big_point_array[0].copy()
        for i, t in enumerate(times[1:]):
            #p[self.big_point_array_movable, 0] = p[self.big_point_array_movable, 0] + p[self.big_point_array_movable, 1] * self.h
            p[:, 0, :] += p[:, 1, :] * self.h
            for j in range(10000):
                p[:, 1, :] = (p[:, 0, :] - self.big_point_array[i, :, 0]) / self.h
                force[:] = 0
                diff[:] = 0
                for element in self.elements:
                    targets = element.target_ids
                    force[targets] += element.eval(t, p[targets])
                    diff[targets] += element.derivative(t, p[targets])

                T = np.linalg.norm(force, axis=1)
                #print(i, j, T)
                np.set_printoptions(suppress=True)
                if np.all(T[self.big_point_array_movable] < 0.01):
                    print(i, j, T)
                    break
                #if 1:#i == 30:
                #    print(i, force.shape, T.shape, diff.shape)
                #print(i, j, "diff", repr(diff).replace("\n", ""))
                #print(i, j, "force", repr(force).replace("\n", ""))
                diff = diff * force[:, None, :] / T[:, None, None]
                #print(i, j, "diff", repr(diff).replace("\n", ""))
                diff[np.isnan(diff)] = 0
                #if 1:#i == 30:
                #    print(i, j, "p", p[self.big_point_array_movable, 0], "v", p[self.big_point_array_movable, 1], "f", force[self.big_point_array_movable], "T", T[self.big_point_array_movable], "diff", diff[self.big_point_array_movable, 0])
                p[self.big_point_array_movable, 0] -= (diff[self.big_point_array_movable, 0] + diff[self.big_point_array_movable, 1]*self.h)*0.001
                #print(j, "p", p[self.big_point_array_movable, 0])
            self.big_point_array[i + 1, self.big_point_array_movable, :, :] = p[self.big_point_array_movable]
            #break
            #self.big_point_array[i+1, self.big_point_array_movable, 1, :] = p[self.big_point_array_movable, 1, :] + force[self.big_point_array_movable] * self.h
            #self.big_point_array[i+1, self.big_point_array_movable, 0, :] = p[self.big_point_array_movable, 0, :] + force[self.big_point_array_movable] * self.h
        return
        X2 = 0
        Y = self.points
        while X2 < self.end_time:
            Y = Y + F2(X2, Y) * self.h
            X2 += self.h
            self.all_points.append(Y)
        return

    def plot_points(self, index, subplot):
        if self.big_point_array is None:
            return
        points = self.big_point_array[index, :, 0]
        types = self.big_point_array_movable
        # plot the different types in different colors
        subplot.plot(points[types == POINT_dynamic, 0], points[types == POINT_dynamic, 1], "bo")
        subplot.plot(points[types == POINT_static, 0], points[types == POINT_static, 1], "ro")
        for i in range(len(self.point_types)):
            x, y = self.big_point_array[index, i, 0]#self.get_point(index, i)
            subplot.text(x, y, i)
        subplot.set_aspect("equal", adjustable="datalim")

    def get_point(self, index, i):
        return np.array([self.all_points[index][i * 4 + 0], self.all_points[index][i * 4 + 2]])

    def plot_elements(self, index, subplot):
        if self.big_point_array is None:
            return
        # iterate over all elements
        for element in self.elements:
            # draw the element
            element.draw(subplot, self.big_point_array[index, element.target_ids])

    def plotCurve(self, index, coord, subplot, time, typ):
        points = self.big_point_array[:, index, 0, coord]
        subplot.plot(self.times, points, "-")
        subplot.plot(self.times[time], points[time], 'bo')
        subplot.set_xlim(self.times[0], self.times[-1])

    def serializePoints(self):
        text = ""
        for point in self.point_definitions:
            text += f'{"POINT_dynamic" if point[0] == POINT_dynamic else "POINT_static"} {point[1]} {point[2]}\n'
        return text

    def serializeElements(self):
        text = ""
        for element in self.elements:
            print(element, str(element))
            text += str(element)+"\n"
        return text

if __name__ == "__main__":
    mysim = MySim()
    self = mysim
    spring = self.elements[0]
    targets = spring.target_ids
    p = self.big_point_array[0, targets]