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
        # initialize the empty lists
        self.point_definitions = []

        self.points = []
        self.point_types = []
        self.all_points = []
        self.elements = []

        if 1: # Maxwell
            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 2, 0)
            self.add_point(POINT_dynamic, 1, 0)

            # add initial elements
            self.add_element(Dashpot(0, 2, strength=1))
            self.add_element(Spring(1, 2, rest=-1, strength=1))
            self.add_element(Force(1, strength_x=1, t_start=1, t_end=3))
        elif 0:
            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 1, 0)
            self.add_point(POINT_dynamic, 2, 0)

            # add initial elements
            self.add_element(Dashpot(0, 1, strength=1))
            self.add_element(Spring(1, 2, rest=1, strength=1))
            self.add_element(Force(2, strength_x=1, t_start=1, t_end=3))
        else:  # Kelvin Voigt
            # add initial points
            self.add_point(POINT_static, 0, 0)
            self.add_point(POINT_dynamic, 1, 0)

            # add initial elements
            self.add_element(Spring(1, 0, rest=-1, strength=1, drawoffset=0.25))
            self.add_element(Dashpot(1, 0, strength=1, drawoffset=-0.25))
            self.add_element(Force(1, strength_x=1, t_start=1, t_end=3))

        # set the end time and the time step
        self.end_time = 10
        self.h = 0.01
        self.gamma = 0.01
        self.m = 0.01

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

    def add_point(self, type, x, y):
        if self.big_point_array is None:
            self.big_point_array = np.zeros([1, 0, 2, 2])
            self.big_point_array_movable = np.zeros([0], dtype=np.bool)
        # add a point to the list of points
        self.big_point_array = np.concatenate((self.big_point_array, [[[[x, y], [0, 0]]]]), axis=1)
        self.big_point_array_movable = np.concatenate((self.big_point_array_movable, [type == POINT_dynamic]))

    def simulateOverdamped(self):
        self.N = len(self.big_point_array_movable)
        times = np.arange(0, self.end_time, self.h)
        self.times = times

        p = self.big_point_array[0].copy()
        self.big_point_array = np.zeros([len(times), self.N, 2, 2])
        self.big_point_array[0] = p.copy()

        # fixed points stay the same at all times
        self.big_point_array[:, ~self.big_point_array_movable, 0, :] = self.big_point_array[0, ~self.big_point_array_movable, 0, :]


        def getCost(par):
            force = np.zeros([self.N, 2])
            diff = np.zeros([self.N, 2, 2])

            p[self.big_point_array_movable, 0] = par
            p[:, 1, :] = (p[:, 0, :] - self.big_point_array[i, :, 0]) / self.h
            force[:] = 0
            diff[:] = 0
            for element in self.elements:
                targets = element.target_ids
                force[targets] += element.eval(t, p[targets])
                diff[targets] += element.derivative(t, p[targets])

            T = np.linalg.norm(force, axis=1)

            #if np.all(T[self.big_point_array_movable] < 0.01):
            #    np.set_printoptions(suppress=True)
            #    print(i, j, T)
            #    break

            diff = diff * force[:, None, :] / T[:, None, None]
            diff[np.isnan(diff)] = 0
            diff[self.big_point_array_movable, 0] += diff[self.big_point_array_movable, 1] * self.h

            return np.sum(T[self.big_point_array_movable]), diff[self.big_point_array_movable, 0].ravel()

        def minim(getCost, par, **kwargs):
            for j in range(10000):
                cost, diff = getCost(par)

                if cost < 0.01:
                    np.set_printoptions(suppress=True)
                    print(i, j, cost)
                    break

                par -= diff * 0.001
            return {"x": par}

        force = np.zeros([self.N, 2])
        diff = np.zeros([self.N, 2, 2])
        p = self.big_point_array[0].copy()
        for i, t in enumerate(times[1:]):
            p[:, 0, :] += p[:, 1, :] * self.h

            """
            for j in range(10000):
                p[:, 1, :] = (p[:, 0, :] - self.big_point_array[i, :, 0]) / self.h
                force[:] = 0
                diff[:] = 0
                for element in self.elements:
                    targets = element.target_ids
                    force[targets] += element.eval(t, p[targets])
                    diff[targets] += element.derivative(t, p[targets])

                T = np.linalg.norm(force, axis=1)

                if np.all(T[self.big_point_array_movable] < 0.01):
                    np.set_printoptions(suppress=True)
                    print(i, j, T)
                    break

                diff = diff * force[:, None, :] / T[:, None, None]
                diff[np.isnan(diff)] = 0
                p[self.big_point_array_movable, 0] -= (diff[self.big_point_array_movable, 0] + diff[self.big_point_array_movable, 1]*self.h)*0.001
            """
            from scipy.optimize import minimize
            res = minim(getCost, p[self.big_point_array_movable, 0].ravel(), jac=True)
            #res = minimize(getCost, p[self.big_point_array_movable, 0].ravel(), jac=True)
            print(i, res)
            p[self.big_point_array_movable, 0] = res["x"]
            p[:, 1, :] = (p[:, 0, :] - self.big_point_array[i, :, 0]) / self.h
            self.big_point_array[i + 1, self.big_point_array_movable, :, :] = p[self.big_point_array_movable]
            #if i == 10:
            #    break

    def simulateOverdamped(self):
        self.N = len(self.big_point_array_movable)
        times = np.arange(0, self.end_time, self.h)
        self.times = times

        p = self.big_point_array[0].copy()
        self.big_point_array = np.zeros([len(times), self.N, 2, 2])
        self.big_point_array[0] = p.copy()

        # fixed points stay the same at all times
        self.big_point_array[:, ~self.big_point_array_movable, 0, :] = self.big_point_array[0, ~self.big_point_array_movable, 0, :]

        def format(targets):
            x = np.concatenate(([targets], [targets]))
            return x.T.ravel(), x.ravel()

        force = np.zeros([self.N, 2])
        diff = np.zeros([self.N, 2, 2])
        p = self.big_point_array[0].copy()
        for i, t in enumerate(times[1:]):
            p[:, 0, :] += p[:, 1, :] * self.h
            F_all = np.zeros(self.N)
            Fx_all = np.zeros([self.N, self.N])
            Fy_all = np.zeros([self.N, self.N])

            for element in self.elements:
                targets = element.target_ids
                F, Fx, Fy = element.eval1d(t, p[targets])
                F_all[targets] += F
                Fx_all[format(targets)] += np.asarray(Fx).ravel()
                Fy_all[format(targets)] += np.asarray(Fy).ravel()
                #diff[targets] += element.derivative(t, p[targets])

            damped = ~np.all(Fy_all == 0, axis=1)

            print(F_all)
            print(Fx_all)
            print(Fy_all)
            print("damped0", np.all(Fy_all == 0, axis=0))
            print("damped1", np.all(Fy_all == 0, axis=1))
            Fy_all[:, ~self.big_point_array_movable] = 0
            Fy_all[~self.big_point_array_movable, ~self.big_point_array_movable] = 1
            print(damped)
            print(Fy_all)
            print(Fy_all.shape, Fy_all.dtype)
            print("-(F_all + Fx_all @ p[:, 0, 0])", -(F_all + Fx_all @ p[:, 0, 0]))
            print("inv")
            print(F_all[damped])
            print(Fx_all[damped, :])
            print(Fy_all[damped][:, damped])
            print("-------------")

            Fx_all2 = Fx_all.copy()
            Fx_all2[:, ~self.big_point_array_movable] = 0
            Fx_all2[~self.big_point_array_movable, ~self.big_point_array_movable] = 1
            x = - np.linalg.inv(Fx_all2[~damped][:, ~damped]) @ (F_all[~damped] + Fx_all2[~damped][:, damped] @ p[damped, 0, 0])
            p[self.big_point_array_movable&~damped, 0, 0] = x[self.big_point_array_movable[~damped]]

            v = - np.linalg.inv(Fy_all[damped][:, damped]) @ (F_all[damped] + Fx_all[damped, :] @ p[:, 0, 0])
            p[self.big_point_array_movable&damped, 1, 0] = v[self.big_point_array_movable[damped]]

            print(F_all[~damped])
            print(Fx_all[~damped][:, ~damped])
            print(Fx_all[~damped][:, damped])
            print("-------------")
            print("p", p[:, 0, 0])
            print("v", p[:, 1, 0])
            self.big_point_array[i + 1, self.big_point_array_movable, :, 0] = p[self.big_point_array_movable, :, 0]
            continue

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
            element.draw(subplot, self.big_point_array[index, element.target_ids])

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
