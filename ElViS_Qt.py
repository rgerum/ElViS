import sys
from qtpy import QtCore, QtGui, QtWidgets
import matplotlib.pyplot as plt
from matplotlib.backends.qt_compat import QtCore, QtWidgets, is_pyqt5
if is_pyqt5():
    from matplotlib.backends.backend_qt5agg import (
        FigureCanvas, NavigationToolbar2QT as NavigationToolbar)
else:
    from matplotlib.backends.backend_qt4agg import (
        FigureCanvas, NavigationToolbar2QT as NavigationToolbar)
from matplotlib.figure import Figure


import springModule
from QtShortCuts import QInputNumber


""" some magic to prevent PyQt5 from swallowing exceptions """
# Back up the reference to the exceptionhook
sys._excepthook = sys.excepthook
# Set the exception hook to our wrapping function
sys.excepthook = lambda *args: sys._excepthook(*args)


class Window(QtWidgets.QWidget):
    time = 0

    def __init__(self):
        super().__init__()
        self.setWindowTitle("ElViS-Simulator")
        self.setMinimumHeight(500)
        layout = QtWidgets.QHBoxLayout(self)
        left_pane = QtWidgets.QVBoxLayout()
        layout.addLayout(left_pane)
        right_pane = QtWidgets.QVBoxLayout()
        layout.addLayout(right_pane)

        self.canvas = FigureCanvas(Figure(figsize=(5, 3)))
        left_pane.addWidget(self.canvas)
        self.subplot_draw = self.canvas.figure.add_subplot(211)
        self.subplot_curve = self.canvas.figure.add_subplot(212)
        self.canvas.figure.canvas.draw()
        self.time_slider = QtWidgets.QSlider()
        self.time_slider.setOrientation(QtCore.Qt.Horizontal)
        self.time_slider.valueChanged.connect(self.timeChange)
        left_pane.addWidget(self.time_slider)

        self.button_start = QtWidgets.QPushButton("run")
        self.button_start.clicked.connect(self.buttonRunClick)
        right_pane.addWidget(self.button_start)

        self.config_time = QInputNumber(right_pane, "Time", value=10)
        self.config_delta = QInputNumber(right_pane, "Delta T", value=0.1)
        self.config_gamma = QInputNumber(right_pane, "Gamma", value=0.01)
        self.config_m = QInputNumber(right_pane, "Mass", value=0.01)

        self.points_input = QtWidgets.QPlainTextEdit()
        right_pane.addWidget(self.points_input)

        self.elements_input = QtWidgets.QPlainTextEdit()
        right_pane.addWidget(self.elements_input)

        self.mysim = springModule.MySim()

        self.points_input.setPlainText(str(self.mysim.serializePoints()))
        self.elements_input.setPlainText(str(self.mysim.serializeElements()))

        self.drawPoints()

        self.buttonRunClick()

    def timeChange(self, event):
        #if (len(self.mysim.all_points) <= 1):
        #    return
        self.oldtime = self.time
        self.time = self.time_slider.value()#/self.time_slider.resolution
        print("self.time", self.time, len(self.mysim.all_points))
        if 1:#len(self.mysim.all_points):
            self.timeChanged()

    def timeChanged(self):
        self.drawPoints(int(self.time))
        self.drawCurve()

    def drawPoints(self, i=0):
        if len(self.mysim.all_points) <= 1:
            self.mysim.all_points = [self.mysim.points]
        self.subplot_draw.cla()
        self.mysim.plot_elements(i, self.subplot_draw)
        self.mysim.plot_points(i, self.subplot_draw)
        self.subplot_draw.set_xlim([-1, 6])
        self.subplot_draw.set_ylim([-3, 3])
        self.subplot_draw.grid(True)
        self.canvas.figure.canvas.draw()

    def drawCurve(self, event=0):
        self.subplot_curve.cla()
        self.subplot_curve.set_xlabel("time")
        self.subplot_curve.set_ylabel("displacement")
        if 1:#len(self.mysim.all_points) > 1:
            try:
                #elf.mysim.plotCurve(int(self.config_point.get()), {"X": 0, "Y": 2}[self.config_coord.get()],
                #                     self.subplot_curve, self.time, self.config_plottype.get())
                self.mysim.plotCurve(2, 0, self.subplot_curve, self.time, "normal")
            except IOError:
                pass
            #for plot in self.hold_plots:
            #    self.mysim.plotHoldCurve(plot, self.subplot_curve, self.config_plottype.get())
            self.subplot_curve.grid(True)
        self.canvas.figure.canvas.draw()
        #self.plot_curve.show()
        #self.toolbar.update()

    def buttonRunClick(self):
        print(self.mysim.serialize())
        #self.mysim.create_DE()
        if len(self.mysim.all_points) or 0:
            del self.mysim.all_points
            self.mysim.all_points = [self.mysim.points]

        self.mysim.end_time = float(self.config_time.value())
        self.mysim.h = float(self.config_delta.value())
        self.mysim.gamma = float(self.config_gamma.value())
        self.mysim.m = float(self.config_m.value())

        #if self.config_type.get() == "Overdamed":
        #self.mysim.Overdamed()
        self.mysim.createPointArray()
        #elif self.config_type.get() == "Overkutta":
        #    self.mysim.Overkutta()
        #elif self.config_type.get() == "Euler":
        #    self.mysim.Euler()
        #elif self.config_type.get() == "RungeKutta":
        #    self.mysim.RungeKutta()

        self.time_slider.setRange(0, self.mysim.end_time/self.mysim.h-1)
        self.time_slider.resolution = self.mysim.h
        self.drawCurve()



app = QtWidgets.QApplication(sys.argv)
window = Window()
window.show()
app.exec_()
