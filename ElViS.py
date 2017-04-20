# -*- coding: utf-8 -*-
"""
Created on Sat Jan 21 15:48:11 2012

@author: -
"""

from pylab import *
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2TkAgg
from Tkinter import *
import tkFileDialog
import pickle

import springModule

class LabeledEntry:
    def __init__(self, frame, name, width=3, command=""):
      self.label = StringVar()
      self.label.set(name)
      self.label_w = Label(frame, textvariable=self.label)
      self.label_w.pack(side=LEFT)
      self.entry = StringVar()
      self.entry_w = Entry(frame, width=width, textvariable=self.entry)
      self.entry_w.pack(side=LEFT)
      if command:
				self.entry_w.bind("<Key>", lambda event: self.entry_w.after(1,command, event))
      
    def setName(self, name, fPack = 0):
      self.label.set(name)
      if fPack:
        if name:
          self.label_w.pack(side=LEFT)
          self.entry_w.pack(side=LEFT)
        else:
          self.label_w.pack_forget()
          self.entry_w.pack_forget()
    
    def set(self, value):
			self.entry.set(value)
         
    def get(self):
			return self.entry.get()
          
class MyApp:
    def __init__(self, parent):

        self.myParent = parent
        self.mysim = springModule.MySim(self);
        parent.title("ElViS Simulator")

        ### Our topmost frame is called mainContainer
        self.mainContainer = Frame(parent) ###
        self.mainContainer.pack()

        #------ constants for controlling layout ------
        button_width = 6      ### (1)

        button_padx = "2m"    ### (2)
        button_pady = "1m"    ### (2)

        buttons_frame_padx =  "3m"   ### (3)
        buttons_frame_pady =  "2m"   ### (3)
        buttons_frame_ipadx = "3m"   ### (3)
        buttons_frame_ipady = "1m"   ### (3)
        # -------------- end constants ----------------

        ### We will use VERTICAL (top/bottom) orientation inside mainContainer.
        ### Inside mainContainer, first we create buttons_frame.
        ### Then we create top_frame and bottom_frame.
        ### These will be our demonstration frames.

        # top frame
        self.top_frame = Frame(self.mainContainer)
        self.top_frame.pack(side=TOP,
            fill=BOTH,
            expand=YES,
            )  ###

        # bottom frame
        self.bottom_frame = Frame(self.mainContainer,
            height=20,
            background="white",
            ) ###
        self.bottom_frame.pack(side=TOP,
            fill=BOTH,
            expand=YES,
            )  ###


        ### Now we will put two more frames, left_frame and right_frame,
        ### inside top_frame.  We will use HORIZONTAL (left/right)
        ### orientation within top_frame.

        # left_frame
        self.left_frame = Frame(self.top_frame, background="red",
            height=250,
            width=250,
            ) ###
        self.left_frame.pack(side=LEFT,
            fill=BOTH,
            expand=YES,
            )  ###
             
        self.figure_draw = Figure(figsize=(5,4), dpi=100)
        self.subplot_draw = self.figure_draw.add_subplot(111)
        self.plot_draw = FigureCanvasTkAgg(self.figure_draw, master=self.left_frame)
        self.plot_draw.get_tk_widget().pack()#side=TOP, fill=BOTH, expand=1)

        self.figure_curve = Figure(figsize=(5,4), dpi=100)
        self.subplot_curve = self.figure_curve.add_subplot(111)
        self.plot_curve = FigureCanvasTkAgg(self.figure_curve, master=self.left_frame)
        self.plot_curve.get_tk_widget().pack()#side=TOP, fill=BOTH, expand=1)
        
        self.toolbar = NavigationToolbar2TkAgg( self.plot_curve, parent )
        self.toolbar.update()
        self.plot_curve._tkcanvas.pack(side=TOP, fill=BOTH, expand=1)
        
        self.time_frame = Frame(self.left_frame, borderwidth=10,
            height=50,
            )
        self.time_frame.pack(fill=BOTH)
        
        self.time_play = Button(self.time_frame, command=self.play)
        self.time_play.configure(text=">")
        self.time_play.pack(side=LEFT)
        self.time_play.bind("<Return>", self.play)
        self.playtimer = 0
        
        
        self.time_scale = Scale(self.time_frame, from_=0, to=0, resolution=1, orient=HORIZONTAL, length=400)
        self.time_scale.pack(side=LEFT, fill=BOTH)
        self.time_scale.bind("<B1-Motion>", self.timeChange)
        self.time = 0
        
        ### right_frame
        self.right_frame = Frame(self.top_frame, #background="tan",
            borderwidth=10,
            width=250,
            )
        self.right_frame.pack(side=RIGHT,
            fill=BOTH,
            expand=YES,
            )  ###
            
         # buttons frame
        self.buttons_frame = Frame(self.right_frame) ###
        self.buttons_frame.pack( fill=BOTH
#            side=TOP,   ###
#            ipadx=buttons_frame_ipadx,
#            ipady=buttons_frame_ipady,
#            padx=buttons_frame_padx,
#            pady=buttons_frame_pady,
            )

        # now we add the buttons to the buttons_frame
        self.button_run = Button(self.buttons_frame, command=self.buttonRunClick)
        self.button_run.configure(text="Run")
        self.button_run.pack(side=LEFT)
        self.button_run.bind("<Return>", self.button2Click_a)
        
        self.button_load = Button(self.buttons_frame, command=self.buttonLoadClick)
        self.button_load.configure(text="Load")
        self.button_load.focus_force()
        self.button_load.pack(side=RIGHT)
        self.button_load.bind("<Return>", self.button1Click_a)

        self.button_save = Button(self.buttons_frame, command=self.buttonSaveClick)
        self.button_save.configure(text="Save")
        self.button_save.pack(side=RIGHT)
        self.button_save.bind("<Return>", self.button2Click_a)
        
        
        Label(self.right_frame, text="").pack(anchor="w")
        
        
        self.config_frame = Frame(self.right_frame)
        self.config_frame.pack(fill=BOTH)
                 
        self.config_type = StringVar(parent)
        self.config_type.set("Overdamed") # default value
        self.config_type_m = OptionMenu(self.config_frame, self.config_type, "Overdamed", "Euler", "RungeKutta")
        self.config_type_m.pack(side=LEFT)
                
        self.config_time   = LabeledEntry(self.config_frame, "Time:", 3)
        self.config_time.set(self.mysim.end_time)
        
        self.config_delta   = LabeledEntry(self.config_frame, "Delta T:", 5)
        self.config_delta.set(self.mysim.h)
        
        self.config_frame2 = Frame(self.right_frame)
        self.config_frame2.pack(fill=BOTH)
       
        self.config_point   = LabeledEntry(self.config_frame2, "Plot Point:", 5, self.drawCurve)
        self.config_point.set(2)
        
        self.config_coord = StringVar(parent)
        self.config_coord.set("Y") # default value
        self.config_coord_m = OptionMenu(self.config_frame2, self.config_coord, *["X", "Y"],command=self.drawCurve)
        self.config_coord_m.pack(side=LEFT)
        self.config_plottype = StringVar(parent)
        self.config_plottype.set("normal") # default value
        self.config_plottype_m = OptionMenu(self.config_frame2, self.config_plottype, *["normal", "loglog"],command=self.drawCurve)
        self.config_plottype_m.pack(side=LEFT)
        
        Label(self.right_frame, text="").pack(anchor="w")
        
        ########################
        ## Points ##############
        ########################
        Label(self.right_frame, text="Points").pack(anchor="w")

        # Point Edit line
        self.points_frame = Frame(self.right_frame)
        self.points_frame.pack(fill=BOTH)
            
        self.selected_point = StringVar()
        self.point_label = Label(self.points_frame, textvariable=self.selected_point)
        self.point_label.pack(side=LEFT)
        
        types = {"static": 0, "dynamic": 1}
        self.point_type = StringVar(parent)
        self.point_type.set("static") # default value
        self.point_type_m = OptionMenu(self.points_frame, self.point_type, *types, command=self.updatePoints)#"static", "dynamic")
        self.point_type_m.pack(side=LEFT)
        
        self.point_x = LabeledEntry(self.points_frame, "X:", 3, self.updatePoints)
        self.point_y = LabeledEntry(self.points_frame, "Y:", 3, self.updatePoints)
        
        self.points_frame2 = Frame(self.right_frame)
        self.points_frame2.pack(fill=BOTH)
        
        self.point_new = Button(self.points_frame2, command=self.newPoint, text="New")
        self.point_new.pack(side=RIGHT)
        self.point_del = Button(self.points_frame2, command=self.delPoint, text="Del")
        self.point_del.pack(side=RIGHT)
        
        # Point Listbox
        self.point_list = Listbox(self.right_frame,selectmode=SINGLE,height=10, width=40)
        self.point_list.pack()
        self.point_list.bind("<Button-1>", lambda event: self.point_list.after(1,self.selectPoint, event))
        self.selected_point.set(-1)
        Label(self.right_frame, text="").pack(anchor="w")
             
        ##########################
        ## Elements ##############
        ##########################
        Label(self.right_frame, text="Elements").pack(anchor="w")

        # Element Edit line
        self.elements_frame = Frame(self.right_frame)
        self.elements_frame.pack(fill=BOTH)
            
        self.selected_element = StringVar()
        self.element_label = Label(self.elements_frame, textvariable=self.selected_element)
        self.element_label.pack(side=LEFT)
        
        self.element_type = StringVar(parent)
        self.element_type.set("spring") # default value
        self.element_types = ["spring", "viscous", "force", "WLCspring", "SinForce", "copy of"]
        self.element_types_dict =  {"spring": 0, "viscous": 1, "force": 2, "WLCspring": 3, "SinForce": 4, "copy of": -1}
        self.element_type_m = OptionMenu(self.elements_frame, self.element_type, *self.element_types, command=self.updateElements)
        self.element_type_m.pack(side=LEFT)
        
        self.element_start = LabeledEntry(self.elements_frame, "Start:", 2, self.updateElements)
        self.element_end   = LabeledEntry(self.elements_frame, "End:", 2, self.updateElements)
        self.element_drawoffset   = LabeledEntry(self.elements_frame, "Drawoffset:", 4, self.updateElements)

        self.elements_frame1 = Frame(self.right_frame)
        self.elements_frame1.pack(fill=BOTH)
        
        self.element_a   = LabeledEntry(self.elements_frame1, "A:", 3, self.updateElements)
        self.element_b   = LabeledEntry(self.elements_frame1, "B:", 3, self.updateElements)
        self.element_c   = LabeledEntry(self.elements_frame1, "C:", 3, self.updateElements)
        self.element_d   = LabeledEntry(self.elements_frame1, "D:", 3, self.updateElements)
        
        self.elements_frame2 = Frame(self.right_frame)
        self.elements_frame2.pack(fill=BOTH)
        self.element_new = Button(self.elements_frame2, command=self.newElement, text="New")
        self.element_new.pack(side=RIGHT)
        self.element_del = Button(self.elements_frame2, command=self.delElement, text="Del")
        self.element_del.pack(side=RIGHT)
        
        # Element Listbox
        self.element_list = Listbox(self.right_frame,selectmode=SINGLE,height=15, width=40)
        self.element_list.pack()
        self.element_list.bind("<Button-1>", lambda event: self.element_list.after(1,self.selectElement, event))
        self.selected_element.set(-1)
        Label(self.right_frame, text="").pack(anchor="w")
        
        self.button_holdplot = Button(self.right_frame, command=self.holdPlot, text="Hold Plot")
        self.button_holdplot.pack(side=TOP, anchor="w")
        self.button_saveplot = Button(self.right_frame, command=self.savePlot, text="Save Plot")
        self.button_saveplot.pack(side=TOP, anchor="w")
        self.hold_plots = []
        
        self.copyindex = {}
        
        self.updatePoints()
        self.updateElements()
        
    def delElement(self):
      self.time = 0
      index = int(self.selected_element.get())
      if index < 0:
        return
      del self.mysim.elements[index]
      if index > len(self.mysim.elements)-1:
        if len(self.mysim.elements)-1 < 0:
					self.element_list.selection_clear(0, -1)
        else:
          self.element_list.select_set(len(self.mysim.elements)-1)
        self.selected_element.set(len(self.mysim.elements)-1)
        print len(self.mysim.elements)-1
      self.updateElements()
      self.selectElement(0)
    
    def newElement(self):
      self.time = 0
      self.mysim.add_element(0,0,0,0,0)
      self.selected_element.set(len(self.mysim.elements)-1)
      self.updateElements()
      self.selectElement(0)
    
    def selectElement(self, event):
      self.time = 0
      index = map(int, self.element_list.curselection())
      print index
      if len(index) == 0:
        return
      if(len(index)): index = index[0]
      else: index = -1
      typ = self.mysim.elements[index][0]
      if index in self.copyindex:
				typ = -1
      self.selected_element.set(index)
      self.element_start.set(self.mysim.elements[index][1])
      self.element_drawoffset.set(self.mysim.elements[index][5])
      if typ == 2:
        self.element_end.setName(0, 1)
        self.element_end.set(-1)
      else:
        self.element_end.setName("End:", 1)
        self.element_end.set(self.mysim.elements[index][2])
      if typ == 0 or typ == 3:
        self.element_a.setName("Restlength:", 1)
        self.element_b.setName("Strength:", 1)
        self.element_c.setName(0, 1)
        self.element_d.setName(0, 1)
        self.element_a.set(self.mysim.elements[index][3])
        self.element_b.set(self.mysim.elements[index][4])
      elif typ == 1:
        self.element_a.setName("Strength:", 1)
        self.element_b.setName(0, 1)
        self.element_c.setName(0, 1)
        self.element_d.setName(0, 1)
        self.element_a.set(self.mysim.elements[index][3])
        self.element_b.set(0)
      elif typ == 2 or typ == 4:
        self.element_a.setName("X:", 1)
        self.element_b.setName("Y:", 1)
        self.element_c.setName("ts:", 1)
        self.element_d.setName("te:", 1)
        self.element_a.set(self.mysim.elements[index][3][0])
        self.element_b.set(self.mysim.elements[index][3][1])
        self.element_c.set(self.mysim.elements[index][4][0])
        self.element_d.set(self.mysim.elements[index][4][1])
      elif typ == -1:
        self.element_a.setName("Copy of:", 1)
        self.element_b.setName(0, 1)
        self.element_c.setName(0, 1)
        self.element_d.setName(0, 1)
        self.element_a.set(self.copyindex[index])
      self.element_type.set(self.element_types[typ]);
      if index in self.copyindex:
				self.element_type.set("copy of");
        
    def updateElements(self, event=0):
      global elements
      self.time = 0
      i = 0
      
      index = int(self.selected_element.get())
      
      if(index >= 0):
        try:
          self.mysim.elements[index][1] = int(self.element_start.get())
          self.mysim.elements[index][2] = int(self.element_end.get())
        except:
          pass
        try:
					self.mysim.elements[index][5] = float(self.element_drawoffset.get())
        except:
					pass
        typ = self.element_types_dict[self.element_type.get()]
        if self.mysim.elements[index][0] != typ:
          self.mysim.elements[index][0] = typ;
          if typ == 0 or typ == 3:
            self.mysim.elements[index][3] = 1
            self.mysim.elements[index][4] = 1
          if typ == 1:
            self.mysim.elements[index][3] = 1
          if typ == 2 or typ == 4:
            self.mysim.elements[index][3] = [1,0]
            self.mysim.elements[index][4] = [0, 100]
          if typ == -1:
						try:
							self.copyindex[index] = int(self.element_a.get())
						except:
							self.copyindex[index] = 0
          elif  index in self.copyindex:
						del self.copyindex[index] 
          self.selectElement(0)
        else:
          if typ == 0 or typ == 3:          
            try:
              self.mysim.elements[index][3] = float(self.element_a.get())
              self.mysim.elements[index][4] = float(self.element_b.get())
            except:
              pass
          if typ == 1:
            try:
              self.mysim.elements[index][3] = float(self.element_a.get())
            except:
              pass
          if typ == 2 or typ == 4:
            try:
              self.mysim.elements[index][3] = [float(self.element_a.get()), float(self.element_b.get())]
              self.mysim.elements[index][4] = [float(self.element_c.get()), float(self.element_d.get())]
            except:
              pass
          if typ == 3:
            try:
              self.mysim.elements[index][3] = [float(self.element_a.get()), float(self.element_b.get())]
              self.mysim.elements[index][4] = [float(self.element_c.get()), float(self.element_d.get())]
            except:
              pass
          if typ == -1:
						try:
							self.copyindex[index] = int(self.element_a.get())
						except:
							self.copyindex[index] = 0
        if typ == -1 and index in self.copyindex and self.copyindex[index] < len(self.mysim.elements):
          self.mysim.elements[index][0] = self.mysim.elements[self.copyindex[index]][0]
          self.mysim.elements[index][3] = self.mysim.elements[self.copyindex[index]][3]
          self.mysim.elements[index][4] = self.mysim.elements[self.copyindex[index]][4]
        for copier, copyof in self.copyindex.iteritems():
          if copyof == index:
            self.mysim.elements[copier][0] = self.mysim.elements[copyof][0]
            self.mysim.elements[copier][3] = self.mysim.elements[copyof][3]
            self.mysim.elements[copier][4] = self.mysim.elements[copyof][4]
      
      self.element_list.delete(0, END)
      i = 0
      for element in self.mysim.elements:
        if i in self.copyindex:
          self.element_list.insert(END, str(element[1])+" "+str(element[2]) +" Element Copy of "+str(self.copyindex[i]) )
        else:
          self.element_list.insert(END, str(element[1])+" "+str(element[2]) +" Element "+self.element_types[element[0]] +" "+str(element[3])+" "+str(element[4]) )
        i += 1

      if(index != -1):
        self.element_list.select_set(index)
      elif len(self.mysim.elements):
        self.element_list.select_set(0)
        self.selectElement(0)
      self.drawPoints()
        
    def delPoint(self):
      self.time = 0
      index = int(self.selected_point.get())
      if index < 0:
        return
      del self.mysim.points[index*4+3]
      del self.mysim.points[index*4+2]
      del self.mysim.points[index*4+1]
      del self.mysim.points[index*4+0]
      if index > len(self.mysim.points)/4-1:
        if len(self.mysim.elements)-1 < 0:
          self.element_list.selection_clear(0, -1)
        else:
          self.selected_point.set(len(self.mysim.points)/4-1)
      self.updatePoints()
    
    def newPoint(self):
      self.time = 0
      self.mysim.add_point(0,0,0)
      self.selected_point.set(len(self.mysim.points)/4-1)
      self.updatePoints()
      self.selectPoint(0)
    
    def selectPoint(self, event):
      self.time = 0
      index = map(int, self.point_list.curselection())
      if(len(index)): index = index[0]
      else: return
      self.selected_point.set(index)
      self.point_x.set(self.mysim.points[index*4+0])
      self.point_y.set(self.mysim.points[index*4+2])
      typename = ["static", "dynamic"]
      self.point_type.set(typename[self.mysim.point_types[index]]);
        
    def updatePoints(self, event=0):
      global points
      self.time = 0
      i = 0
      typename = ["static", "dynamic"]
#      
      index = int(self.selected_point.get())
      
      if(index >= 0):
        try:
          self.mysim.points[index*4+0] = float(self.point_x.get())
          self.mysim.points[index*4+2] = float(self.point_y.get())
        except:
          pass
        types = {"static": 0, "dynamic": 1}
        self.mysim.point_types[index] = types[self.point_type.get()];
      
      self.point_list.delete(0, END)
      for j in range(0,len(self.mysim.points)/4):
        self.point_list.insert(END, str(i)+" point "+typename[self.mysim.point_types[j]] +" "+str(self.mysim.points[j*4+0])+" "+str(self.mysim.points[j*4+2]) )
        i += 1
      if(index != -1):
        self.point_list.select_set(index)
      elif len(self.mysim.points):
        self.point_list.select_set(0)
        self.selectPoint(0)
      self.drawPoints()
      
    def drawPoints(self, i=0):
      if(len(self.mysim.all_points)<=1):
        print "OutofRange"
        self.mysim.all_points = [self.mysim.points]
      self.subplot_draw.cla()
      self.mysim.plot_elements(i, self.subplot_draw)
      self.mysim.plot_points(i, self.subplot_draw)
      self.subplot_draw.set_xlim([-1,6])
      self.subplot_draw.set_ylim([-1,6])
      self.subplot_draw.grid(True)
      self.plot_draw.show()
      
    def drawCurve(self, event=0):
      self.subplot_curve.cla()
      if(len(self.mysim.all_points)>1):
        try:
          self.mysim.plotCurve(int(self.config_point.get()), {"X":0,"Y":2}[self.config_coord.get()], self.subplot_curve, self.time, self.config_plottype.get())
        except:
			  	pass
        for plot in self.hold_plots:
            self.mysim.plotHoldCurve(plot,self.subplot_curve, self.config_plottype.get())
        self.subplot_curve.grid(True)
      self.plot_curve.show()         
      self.toolbar.update()
            
    def play(self, event=0):
        if(self.playtimer):
          self.time_play.after_cancel(self.playtimer)
          self.playtimer = 0
          self.time_play.config(text=">")
        else:
          if self.time == self.mysim.end_time:
            self.time = 0
          self.playtimer = self.time_play.after(1, self.doplay)
          self.time_play.config(text="||")
    
    def doplay(self,event=0):
        if(len(self.mysim.all_points)<=1):
					return
        self.time = min(self.time+self.mysim.h*10, self.mysim.end_time)
        self.time_scale.set(self.time)
        self.timeChanged()
        if self.time == self.mysim.end_time:
          self.playtimer = 0
          self.time_play.config(text=">")
        else:
          self.playtimer = self.time_play.after(1, self.doplay)

    def timeChange(self, event):
        if(len(self.mysim.all_points)<=1):
					return
        self.oldtime = self.time
        self.time = self.time_scale.get()
        if len(self.mysim.all_points):
          self.timeChanged()
        
    def timeChanged(self):
        #print abs(time-self.oldtime)
        #print 10*self.mysim.h
        #if len(self.mysim.all_points) and abs(time-self.oldtime)>10*self.mysim.h:
#        self.time = time
        #self.mysim.points = self.mysim.all_points[int(self.time/self.mysim.h)]
        self.drawPoints(int(self.time/self.mysim.h))
        self.drawCurve()
        #print self.time_scale.get()

    def buttonLoadClick(self):
        filename = tkFileDialog.askopenfilename(filetypes=["ElvisStorage {.elv}"])
        print "Load " + filename
        fp = open(filename, "r")
        del self.mysim
        self.mysim = pickle.load(fp)
        fp.close()
        self.updateElements()
        self.updatePoints()
        self.drawPoints()
        self.drawCurve()

    def buttonSaveClick(self):
        filename = tkFileDialog.asksaveasfilename(filetypes=["ElvisStorage {.elv}"])
        print "Save " + filename
        fp = open(filename, "w")
        pickle.dump(self.mysim, fp)
        fp.close()
        
    def holdPlot(self):
        self.hold_plots.append(self.mysim.getCurve(int(self.config_point.get()), {"X":0,"Y":2}[self.config_coord.get()], self.subplot_curve, self.time, self.config_plottype.get()))
        self.drawCurve()
        
    def savePlot(self):
        plot = self.mysim.getCurve(int(self.config_point.get()), {"X":0,"Y":2}[self.config_coord.get()], self.subplot_curve, self.time, self.config_plottype.get())
        filename = tkFileDialog.asksaveasfilename(filetypes=["Textfile {.txt}"])
        print "Save " + filename
        fp = open(filename, "w")
        for i in range(0, len(plot[0])):
            fp.write(str(plot[0][i])+", "+str(plot[1][i])+"\n")
        fp.close()

    def buttonRunClick(self):
       self.mysim.create_DE()
       if len(self.mysim.all_points) or 0:
#         self.mysim.points = self.mysim.all_points[0]
         del self.mysim.all_points
         self.mysim.all_points = [self.mysim.points]
#       copies = []
#       for i in range(0, len(self.mysim.elements)):
#				 if self.mysim.elements[i][0] == -1:
#					 copies.append(i)
#					 self.mysim.elements[i] = 
					 
       
       self.mysim.end_time = float(self.config_time.get())
       self.mysim.h = float(self.config_delta.get())
        
       if self.config_type.get() == "Overdamed":
         self.mysim.Overdamed()
       elif self.config_type.get() == "Euler":
         self.mysim.Euler()
       elif self.config_type.get() == "RungeKutta":
         self.mysim.RungeKutta()
       
       
       self.time_scale.config(to=self.mysim.end_time, resolution=self.mysim.h)
       self.drawCurve()

    def button1Click_a(self, event):
        self.button1Click()

    def button2Click_a(self, event):
        self.button2Click()


root = Tk()
myapp = MyApp(root)
root.mainloop()