import sys
import numpy as np
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
from elements import Spring, Dashpot, Force
from QtShortCuts import QInputNumber, QInputChoice


""" some magic to prevent PyQt5 from swallowing exceptions """
# Back up the reference to the exceptionhook
sys._excepthook = sys.excepthook
# Set the exception hook to our wrapping function
sys.excepthook = lambda *args: sys._excepthook(*args)

class MyList(QtWidgets.QListWidget):
    def __init__(self, layout):
        super().__init__()
        layout.addWidget(self)

    def setData(self, items):
        if len(items) < self.count():
            update = items
            remove = np.arange(len(items), self.count())[::-1]
            add = []
        else:
            update = items[:self.count()]
            add = items[self.count():]
            remove = []

        for i in remove:
            for name in dir(self):
                print(name)
            self.takeItem(i)

        for i, v in enumerate(update):
            self.item(i).setText(v)

        for v in add:
            self.addItem(v)

class Properites(QtWidgets.QWidget):
    def __init__(self, layout, parent):
        super().__init__()
        self.parent = parent
        layout.addWidget(self)
        QtWidgets.QVBoxLayout(self)

    def initSignals(self):
        for key, value in self.properties.items():
            value.valueChanged.connect(lambda x, key=key: self.change_value(x, key))

    def setTarget(self, element):
        self.element = element
        for key, value in self.properties.items():
            value.setValue(getattr(element, key))

    def change_value(self, value, key):
        setattr(self.element, key, value)
        self.parent.updateList()


class PropertiesSpring(Properites):
    def __init__(self, layout, parent):
        super().__init__(layout, parent)
        self.properties = {
            "start": QInputChoice(self.layout(), "node 1", 0, [0], ["0"]),
            "end": QInputChoice(self.layout(), "node 2", 0, [0], ["0"]),
            "strength": QInputNumber(self.layout(), "k"),
            "rest": QInputNumber(self.layout(), "rest"),
        }
        self.initSignals()

class PropertiesDashpot(Properites):
    def __init__(self, layout, parent):
        super().__init__(layout, parent)
        self.properties = {
            "start": QInputChoice(self.layout(), "node 1", 0, [0], ["0"]),
            "end": QInputChoice(self.layout(), "node 2", 0, [0], ["0"]),
            "strength": QInputNumber(self.layout(), "eta"),
        }
        self.initSignals()


class PropertiesForce(Properites):
    def __init__(self, layout, parent):
        super().__init__(layout, parent)
        self.properties = {
            "start": QInputChoice(self.layout(), "node 1", 0, [0], ["0"]),
            "strength_x": QInputNumber(self.layout(), "strength_x"),
            "strength_y": QInputNumber(self.layout(), "strength_y"),
        }
        self.initSignals()


class ListPoints(QtWidgets.QWidget):
    def __init__(self, parent, mysim):
        super().__init__()
        parent.addWidget(self)
        self.mysim = mysim
        layout = QtWidgets.QVBoxLayout(self)
        self.list = MyList(layout)
        self.updateList()
        self.list.currentItemChanged.connect(self.selected)
        self.input_properties = {}
        for name, widget in [["Spring", PropertiesSpring], ["Dashpot", PropertiesDashpot], ["Force", PropertiesForce]]:
            self.input_properties[name] = widget(layout, self)
            self.input_properties[name].setVisible(False)

        self.input_remove = QtWidgets.QPushButton("remove")
        self.input_remove.clicked.connect(self.remove)
        layout.addWidget(self.input_remove)
        layout = QtWidgets.QHBoxLayout()
        self.layout().addLayout(layout)
        self.input_type = QInputChoice(layout, "Type", Spring, [Spring, Dashpot, Force], ["Spring", "Dashpot", "Force"])
        self.input_add = QtWidgets.QPushButton("add")
        self.input_add.clicked.connect(self.add)
        layout.addWidget(self.input_add)

    def remove(self):
        self.mysim.elements.pop(self.list.currentRow())
        self.updateList()

    def add(self):
        self.mysim.elements.append(self.input_type.value()())
        self.updateList()

    def selected(self, item):
        element = self.mysim.elements[self.list.currentRow()]
        for key, value in self.input_properties.items():
            value.setVisible(False)
        input = self.input_properties[type(element).__name__]
        input.properties["start"].setChoices(np.arange(self.mysim.big_point_array_movable.shape[0]))
        if "end" in input.properties:
            input.properties["end"].setChoices(np.arange(self.mysim.big_point_array_movable.shape[0]))
        input.setVisible(True)
        input.setTarget(element)

    def updateList(self):
        self.list.setData([str(e) for e in self.mysim.elements])

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

        self.progress_bar = QtWidgets.QProgressBar()
        left_pane.addWidget(self.progress_bar)

        self.button_start = QtWidgets.QPushButton("run")
        self.button_start.clicked.connect(self.buttonRunClick)
        right_pane.addWidget(self.button_start)

        self.config_time = QInputNumber(right_pane, "Time", value=10)
        self.config_delta = QInputNumber(right_pane, "Delta T", value=0.1)

        self.points_input = QtWidgets.QPlainTextEdit()
        right_pane.addWidget(self.points_input)

        self.mysim = springModule.MySim()

        self.list = ListPoints(right_pane, self.mysim)

        self.points_input.setPlainText(str(self.mysim.serializePoints()))

        self.drawPoints()

        self.buttonRunClick()
        self.timeChanged()

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
        self.subplot_draw.set_xlim([-1, 3])
        self.subplot_draw.set_ylim([-2, 2])
        self.subplot_draw.grid(True)
        self.mysim.plot_elements(i, self.subplot_draw)
        self.mysim.plot_points(i, self.subplot_draw)
        self.canvas.figure.canvas.draw()

    def drawCurve(self, event=0):
        self.subplot_curve.cla()
        self.subplot_curve.set_xlabel("time")
        self.subplot_curve.set_ylabel("displacement")
        if 1:#len(self.mysim.all_points) > 1:
            try:
                self.mysim.plotCurve(1, 0, self.subplot_curve, self.time, "normal")
            except IOError:
                pass
            self.subplot_curve.grid(True)
        self.canvas.figure.canvas.draw()

    def buttonRunClick(self):
        print(self.mysim.serialize())
        #self.mysim.create_DE()
        if len(self.mysim.all_points) or 0:
            del self.mysim.all_points
            self.mysim.all_points = [self.mysim.points]

        self.mysim.end_time = float(self.config_time.value())
        self.mysim.h = float(self.config_delta.value())

        self.mysim.simulateOverdamped(self.progressCallback)
        self.time_slider.setRange(0, self.mysim.end_time/self.mysim.h-1)
        self.time_slider.resolution = self.mysim.h
        self.drawCurve()

    def progressCallback(self, i, max):
        self.progress_bar.setRange(0, max)
        self.progress_bar.setValue(i)



app = QtWidgets.QApplication(sys.argv)
window = Window()
window.show()
app.exec_()
