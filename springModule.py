# -*- coding: utf-8 -*-
"""
ElViS Simulator

ELastic-VIscous-System Simulator

"""
import numpy as np
from elements import Spring, Dashpot, Force

POINT_static = 0
POINT_dynamic = 1


class MySim:
    big_point_array = None

    def __init__(self):

        # set the end time and the time step
        self.end_time = 10
        self.h = 0.01
        self.gamma = 0.01
        self.m = 0.01

        self.plot_point = 0

        # initialize the empty lists
        self.point_definitions = []

        self.points = []
        self.point_types = []
        self.all_points = []
        self.elements = []

        if 1: # Maxwell
            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 1, 0)
            self.add_point(POINT_dynamic, 2, 0)
            self.add_point(POINT_dynamic, 3, 0)

            # add initial elements
            self.add_element(Spring(0, 1, rest=1, strength=1))
            self.add_element(Dashpot(1, 2, strength=1))
            self.add_element(Spring(2, 3, rest=1, strength=1))
            self.add_element(Force(3, strength=1, t_start=1, t_end=3))

            self.plot_point = 3
        elif 0:
            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 1, 0)
            self.add_point(POINT_dynamic, 2, 0)

            # add initial elements
            self.add_element(Dashpot(0, 1, strength=1))
            self.add_element(Spring(1, 2, rest=1, strength=1))
            self.add_element(Force(2, strength=1, t_start=1, t_end=3))
        elif 0:
            self.add_point(POINT_static, 1, 0)
            self.add_point(POINT_dynamic, 2, 0)

            # add initial elements
            self.add_element(Spring(1, 0, rest=-1, strength=1, drawoffset=0))
            self.add_element(Force(1, strength=1, t_start=1, t_end=3))
        else:  # Kelvin Voigt
            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 1, 0)

            # add initial elements
            #self.add_element(Spring(1, 0, rest=-1, strength=1, drawoffset=0.25))
            self.add_element(Dashpot(1, 0, strength=1, drawoffset=-0.25))
            self.add_element(Force(1, strength=1, t_start=0, t_end=3))

    def setData(self, data):
        if "plot_point" in data:
            self.plot_point = data["plot_point"]
        if "points" in data:
            self.big_point_array = None
            for point in data["points"]:
                self.add_point(*point)
        if "elements" in data:
            self.elements = []
            for element in data["elements"]:
                self.add_element(eval(element[0])(*element[1:]))
        self.updateDrawOffsets()

    def updateDrawOffsets(self):
        element_count = np.zeros(self.get_point_count())
        for element in self.elements:
            point = np.min(element.target_ids)
            element.drawoffset = element_count[point]/2
            element_count[point] += 1
        for element in self.elements:
            point = np.min(element.target_ids)
            element.drawoffset -= (element_count[point]-1)/4

    def serialize(self):
        text = "points = "
        points = []
        for i in range(len(self.point_types)):
            points.append("[%d, %s, %s]" % (self.big_point_array_movable[i], self.big_point_array[0, i, 0, 0], self.big_point_array[0, i, 0, 1]))
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

    def add_point(self, type, x, y=0):
        if self.big_point_array is None:
            self.big_point_array = np.zeros([1, 0, 2, 2])
            self.big_point_array_movable = np.zeros([0], dtype=np.bool)
        if self.big_point_array.shape[0] != 1:
            self.big_point_array = self.big_point_array[0:1]
        # add a point to the list of points
        print(self.big_point_array.shape, np.array([[[[x, y], [0, 0]]]]).shape)
        self.big_point_array = np.concatenate((self.big_point_array, [[[[x, y], [0, 0]]]]), axis=1)
        self.big_point_array_movable = np.concatenate((self.big_point_array_movable, [type == POINT_dynamic]))

    def del_point(self, index):
        for element in self.elements:
            for i in range(len(element.target_ids)):
                if element.target_ids[i] > index:
                    element.target_ids[i] -= 1
        self.big_point_array = np.delete(self.big_point_array, index, axis=1)
        self.big_point_array_movable = np.delete(self.big_point_array_movable, index)

    def get_point(self, index):
        return [self.big_point_array_movable[index], self.big_point_array[0, index, 0, 0], self.big_point_array[0, index, 0, 1]]

    def set_point(self, index, data):
        self.big_point_array_movable[index] = data[0]
        self.big_point_array[0, index, 0, 0] = data[1]

    def get_point_count(self):
        return self.big_point_array.shape[1]

    def iter_points(self):
        for i in range(self.get_point_count()):
            yield self.get_point(i)

    def simulateOverdamped(self, progressCallback=None):
        self.N = len(self.big_point_array_movable)
        times = np.arange(0, self.end_time, self.h)
        # double time values
        #times = np.concatenate(([times], [times])).T.ravel()[1:-1]
        self.times = times

        p = self.big_point_array[0].copy()
        self.big_point_array = np.zeros([len(times), self.N, 2, 2])
        self.big_point_array[0] = p.copy()

        # fixed points stay the same at all times
        self.big_point_array[:, ~self.big_point_array_movable, 0, :] = self.big_point_array[0, ~self.big_point_array_movable, 0, :]

        def format(targets):
            x = np.concatenate(([targets], [targets]))
            return x.T.ravel(), x.ravel()

        F = np.zeros(self.N)
        Fx = np.zeros([self.N, self.N])
        Fv = np.zeros([self.N, self.N])

        p = self.big_point_array[0, :, 0, 0].copy()
        t_old = times[0]
        # iterate over all times
        for i, t in enumerate(times[1:]):
            p_old = self.big_point_array[i, :, 0, 0]
            F[:] = 0
            Fx[:] = 0
            Fv[:] = 0

            # iterate over all elements
            for element in self.elements:
                # get the ids of the nodes
                targets = element.target_ids
                # get the matrices of the elements
                F_node, Fx_node, Fy_node = element.eval1d(t, p[targets], 1)
                # update the total nodes matrices
                F[targets] += F_node
                Fx[format(targets)] += np.asarray(Fx_node).ravel()
                Fv[format(targets)] += np.asarray(Fy_node).ravel()

            # fixed nodes are non-movables or completely unconnected nodes
            unconnected = np.all(Fx == 0, axis=1) & np.all(Fv == 0, axis=1)
            fixed = ~self.big_point_array_movable | unconnected
            free = ~fixed

            # divide Fv by Delta t
            Fv /= (t-t_old)

            # combine the matrix to be inverted
            Fxv = Fx + Fv
            Fxv[:, fixed] = 0
            Fxv[fixed, fixed] = 1
            # solve for the positions of the free nodes
            x = np.linalg.inv(Fxv) @ (Fv[:, free] @ p_old[free] - Fx[:, fixed] @ p[fixed] - F)

            # the positions of the free nodes are used for the update
            self.big_point_array[i + 1, free, 0, 0] = x[free]

            # store the old time
            t_old = t

            # update the progress bar
            if progressCallback is not None:
                progressCallback(i, len(self.times))

        # a final update of the progress bar
        progressCallback(len(self.times), len(self.times))

    def plot_points(self, index, subplot):
        if self.big_point_array is None:
            return
        points = self.big_point_array[index, :, 0]
        types = self.big_point_array_movable
        # plot the different types in different colors
        subplot.plot(points[types == POINT_dynamic, 0], points[types == POINT_dynamic, 1], "bo")
        subplot.plot(points[types == POINT_static, 0], points[types == POINT_static, 1], "ro")
        for i in range(len(self.point_types)):
            x, y = self.big_point_array[index, i, 0]
            subplot.text(x, y, i)
        subplot.set_aspect("equal", adjustable="datalim")

    def plot_elements(self, index, subplot):
        if self.big_point_array is None:
            return
        # iterate over all elements
        for element in self.elements:
            # draw the element
            try:
                element.draw(subplot, self.big_point_array[index, element.target_ids])
            except IndexError:
                pass

    def plotCurve(self, index, coord, subplot, time, typ):
        points = self.big_point_array[:, index, 0, coord]
        subplot.plot(self.times, points, "-")
        subplot.plot(self.times[time], points[time], 'bo')
        subplot.set_xlim(self.times[0], self.times[-1])

    def serializePoints(self):
        text = ""
        for i, moveable in enumerate(self.big_point_array_movable):
            text += f'{"POINT_dynamic" if moveable else "POINT_static"} {self.big_point_array[0, 0, 0, 0]} {self.big_point_array[0, 0, 0, 1]}\n'
        return text

    def serializeElements(self):
        text = ""
        for element in self.elements:
            print(element, str(element))
            text += str(element)+"\n"
        return text
