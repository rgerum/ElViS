### This is an example on how to use ElViS in a script form
### It simulates a muscle in a classical Hill model with a contractile element, two spring and a viscous element
### as well as a third spring in series that corresponds to an external pillar

import numpy as np
## SET BACKEND
import matplotlib as mpl
mpl.use('TkAgg')
import matplotlib.pyplot as plt
import matplotlib.animation as animation

import springModule
from elements import Spring, Dashpot, Force, ForceGenerator

POINT_static = 0
POINT_dynamic = 1

def init_sim(sim, k):
    # initialize the empty lists
    sim.points = []
    sim.point_types = []
    sim.all_points = []

    # add initial points
    sim.add_point(POINT_static, 0, 0)
    sim.add_point(POINT_dynamic, 1, 0)
    sim.add_point(POINT_dynamic, 2, 0)
    sim.add_point(POINT_static, 3, 0)

    # add initial elements
    sim.elements = []
    sim.add_element(Spring(0, 1, rest=1, strength=10, drawoffset=0.2))
    #cardiac action potential. see https://www.researchgate.net/figure/Cardiac-action-potential-parameters-and-phases-and-characteristics-of-different_fig2_221912367
    sim.add_element(ForceGenerator(0, 1, strength=1, t_start=0.21, t_end=3.25, duration_rise=0.005, duration_fall=1.5))
    sim.add_element(Dashpot(0, 1, strength=5, drawoffset=-0.2))
    sim.add_element(Spring(1, 2, rest=1, strength=15))
    sim.add_element(Spring(2, 3, rest=1, strength=100))

    # set the end time and the time step
    sim.end_time = 10
    sim.h = 0.003
    sim.gamma = 100
    sim.mass =0.0005

def simulate(mysim):
    mysim.create_DE()
    if len(mysim.all_points) or 0:
        del mysim.all_points
        mysim.all_points = [mysim.points]

    mysim.RungeKutta()

    return mysim.getCurve(2, 0)

sim = springModule.MySim(None)

plt.subplot(121)

# init_sim(sim)
# x1, y1 = simulate(sim)
# y1 = np.array(y1)
# y1=-y1
# y1 += 2
# y1=y1-np.min(y1)
# plt.plot(x1, y1, label="simulation")


for k in (1, 2):
    init_sim(sim,k)
    x, y = simulate(sim)
    y = np.array(y)
    # x=x/np.max(x)
    # y=y/np.max(y)
    y=-y
    y += 2
    y=y-np.min(y)
    # y2=y2/np.max(y2)
    print(k, np.max(y))
    plt.plot(x, y, label=str(k))

#Plot data
data_x, data_y = np.loadtxt("data.txt")
data_x = data_x/np.max(data_x)*5
data_y=-data_y
data_y=data_y-np.min(data_y)
data_y=data_y/np.max(data_y)
data_y=data_y*np.max(y)

ts = np.arange(0, 10, 0.01)
ys = []
for t in ts:
    y = sim.elements[1].eval(t, np.array([0, 0]), np.array([1, 0]), np.array([0, 0]), np.array([0, 0]), 1)[0]
    ys.append(y)
ys = np.array(ys)
ys *= np.max(data_y)
plt.plot(ts, ys)

plt.plot(data_x, data_y, label="data")

plt.legend()

plt.subplot(122)
sim.plot_elements(200, plt.gca())
sim.plot_points(200, plt.gca())
plt.axis("equal")
#plt.plot(x, y2, label="simulation")
#sim.plotCurve(2, 0, plt.gca(), 2, "normal")


plt.show()