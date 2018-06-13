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
    def __init__(self, window):
        # initialize the empty lists
        self.points = []
        self.point_types = []
        self.all_points = []

        # add initial points
        self.add_point(POINT_static, 0, 0)
        self.add_point(POINT_dynamic, 1, 0)
        self.add_point(POINT_dynamic, 2, 0)
        self.add_point(POINT_dynamic, 3, 0)
        self.add_point(POINT_static, 4, 0)

        # add initial elements
        self.elements = []
        self.add_element(Spring(0, 1, rest=1, strength=10))
        self.add_element(Viscous(0, 1, strength=8))
        self.add_element(Force(1, strength_x=1, t_start=1, t_end=3))

        # set the end time and the time step
        self.end_time = 10
        self.h = 0.01

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
        # add a point to the list of points
        self.points.append(x + .0)
        self.points.append(0)
        self.points.append(y + .0)
        self.points.append(0)
        self.point_types.append(type)

    def create_DE(self):
        # add empty list of equations
        self.equations = []
        for i in range(len(self.points)):
            self.equations.append([])

        # iterate over all elements and add the element to the equation for the point it is attached to
        for i, element in enumerate(self.elements):
            # both points
            for j, target in zip([1, -1], element.targets()):
                # only if it is a valid point
                if target < len(self.equations):
                    self.equations[target].append([i, j])

    def Eval_Elem(self, X, Y, index, direction, fGetY):
        return self.elements[index].eval_raw(X, Y, index, direction, fGetY)

    def F(self, X, Y):
        Z = np.zeros(len(Y))

        for j in range(len(Y) // 2):
            if self.point_types[j // 2] == POINT_static:
                continue
            Z[j * 2 + 0] = Y[j * 2 + 1]
            for el in self.equations[j // 2]:
                Z[j * 2 + 1] += self.Eval_Elem(X, Y, el[0], el[1], j % 2)

        return Z

    def F2(self, X, Y):
        Z = np.zeros(len(Y))

        for j in range(0, len(Y) // 2):
            if self.point_types[j // 2] == POINT_static:
                continue
            for el in self.equations[j // 2]:
                Z[j * 2 + 1] += self.Eval_Elem(X, Y, el[0], el[1], j % 2)
            Z[j * 2 + 0] = Z[j * 2 + 1]
            Z[j * 2 + 1] -= Y[j * 2 + 1]

        return Z

    def RungeKutta(self):
        X = 0
        Y = self.points
        while X < self.end_time:
            K1 = self.F(X, Y) * self.h  # with array result
            K2 = self.F(X + self.h / 2, Y + K1 / 2) * self.h
            K3 = self.F(X + self.h / 2, Y + K2 / 2) * self.h
            K4 = self.F(X + self.h, Y + K3) * self.h
            Y = Y + (K1 + 2 * K2 + 2 * K3 + K4) / 6
            X += self.h
            self.all_points.append(Y)
        return

    def Euler(self):
        X2 = 0
        Y = self.points
        while X2 < self.end_time:
            Y = Y + self.F(X2, Y) * self.h
            X2 += self.h
            self.all_points.append(Y)
        return

    def Overdamed(self):
        X2 = 0
        Y = self.points
        while X2 < self.end_time:
            Y = Y + self.F2(X2, Y) * self.h
            X2 += self.h
            self.all_points.append(Y)
        return

    def plot_points(self, index, subplot):
        # convert points from the time "index" to numpy array (discarding every secend element because it is a velocity)
        points = np.array(self.all_points[index])[::2]
        points = points.reshape(len(self.all_points[index])//4, 2)
        types = np.array(self.point_types)
        # plot the different types in different colors
        subplot.plot(points[types == POINT_dynamic, 0], points[types == POINT_dynamic, 1], "bo")
        subplot.plot(points[types == POINT_static, 0], points[types == POINT_static, 1], "ro")

    def get_point(self, index, i):
        return np.array([self.all_points[index][i * 4 + 0], self.all_points[index][i * 4 + 2]])

    def plot_elements(self, index, subplot):
        # iterate over all elements
        for element in self.elements:
            # ignore those with invalid targets
            if element.start >= len(self.all_points[index]) / 4 or element.end >= len(self.all_points[index]) / 4:
                continue
            # draw the element
            element.draw(subplot, self.get_point(index, element.start), self.get_point(index, element.end))

    def plotCurve(self, index, coord, subplot, time, typ):
        x = []
        z = []
        time_value = 0
        i = 0
        # print all_points
        for Y in self.all_points:
            if i * self.h <= time:
                time_value = Y[index * 4 + coord]
            x.append(i * self.h)
            z.append(Y[index * 4 + coord])
            i += 1
        if typ == "normal":
            subplot.plot(x, z, '-')
            subplot.plot(time, time_value, 'bo')
        if typ == "loglog":
            subplot.loglog(x, z, '-')
            subplot.loglog(time, time_value, 'bo')

    def plotHoldCurve(self, curve, subplot, typ):
        if typ == "normal":
            subplot.plot(curve[0], curve[1], '-')
        if typ == "loglog":
            subplot.loglog(curve[0], curve[1], '-')

    def getCurve(self, index, coord, subplot, time, typ):
        x = []
        z = []
        i = 0
        # print all_points
        for Y in self.all_points:
            x.append(i * self.h)
            z.append(Y[index * 4 + coord])
            i += 1
        return [x, z]
