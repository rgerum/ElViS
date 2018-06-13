# -*- coding: utf-8 -*-
"""
ElViS Simulator

ELastic-VIscous-System Simulator

"""
from pylab import *

TYPE_spring  = 0;
TYPE_viscous = 1;
TYPE_force = 2;
TYPE_WLCspring  = 3;
TYPE_SinForce  = 4;

POINT_static = 0;
POINT_dynamic = 1;

class MySim:
    def __init__(self, window):
        self.points = [];
        self.point_types = []
        self.all_points = []

        self.add_point(POINT_static,0,0)
        self.add_point(POINT_dynamic,1,0)
        self.add_point(POINT_dynamic,2,0)
        self.add_point(POINT_dynamic,3,0)
        self.add_point(POINT_static,4,0)
        #self.add_point(POINT_dynamic,1.7,3.9);
        
        self.elements = []
        self.add_element(TYPE_spring, 0, 1, 1.4, 100);
        self.add_element(TYPE_viscous, 0,  1, 80,0);
        
#        self.add_element(TYPE_spring, 1, 2, 0.8, 10);
#        self.add_element(TYPE_viscous, 1, 2, 1, 0);
        
        #self.elements = self.add_element(self.elements, TYPE_spring, 2, 3, 2, 1);
        
        #self.elements = self.add_element(self.elements, TYPE_spring, 3, 4, 2, 1);
        
#        self.add_element(TYPE_viscous, 2, 3, 1, 0);
#        self.add_element(TYPE_spring, 2, 3, 0.8,10);
        
#        self.add_element(TYPE_viscous, 3, 4, 80,0);
#        self.add_element(TYPE_spring, 3, 4, 1.4, 100);
        
        
#        self.add_element(TYPE_force,  2, -1, [0,1], [0, 2]);
        #self.elements = self.add_element(self.elements, TYPE_force,  2, -1, [0,1], [6, 4]);
        #self.elements = self.add_element(self.elements, TYPE_force,  2, -1, [0,1], [22, 20]);
        #self.elements = self.add_element(self.elements, TYPE_force,  2, -1, [0,1], [32, 30]);
        #self.elements = self.add_element(self.elements, TYPE_viscous, 0, 2);
        #self.elements = self.add_element(self.elements, TYPE_viscous, 2, 3);
        
        self.end_time =10
        self.h = 0.01

    def add_element(self, type, start, ende, rest, strength, drawoffset=0):
        element = [type, start, ende, rest, strength, drawoffset];
        self.elements.append(element);
     
    def add_point(self, type, x, y):
        #self.points.append([type, x, y, 0, 0])
        self.points.append(x+.0)
        self.points.append(0)
        self.points.append(y+.0)
        self.points.append(0)
        self.point_types.append(type)
     
    def create_DE(self):
        self.equations = [];
        for i in range(0,len(self.points)):
            equation = [];
            self.equations.append(equation);
    
        for i in range(0,len(self.elements)):
            start = self.elements[i][1]
            ende = self.elements[i][2]
            if start >= len(self.equations) or ende >= len(self.equations):
                continue
            self.equations[start].append([i,1]);
            if(self.elements[i][0] != TYPE_force):
              self.equations[ende].append([i,-1]);
      
    def Eval_Elem(self, X, Y, index, direction, fGetY):
      element = self.elements[index]
      if(element[0] == TYPE_force):
        if(X > element[4][1] or X < element[4][0]):
          return 0
    #    print ["Force", element[3]]
        return element[3][fGetY];
      if(element[0] == TYPE_SinForce):
        if(X > element[4][1] or X < element[4][0]):
          return 0
    #    print ["Force", element[3]]
        return element[3][fGetY]*cos(X*2*pi);
      if(element[0] == TYPE_WLCspring):
        dX = Y[element[2]*4+0]-Y[element[1]*4+0]
        dY = Y[element[2]*4+2]-Y[element[1]*4+2]
        length = sqrt(dX**2+dY**2)
        print("elem3 "+str(element[3]))
        print((4*(1-dX/element[3])**2))
        print(dX/element[3])
        factor = ( 1./(4*(1-dX/element[3])**2) - 1/4 + dX/element[3] )*direction*element[4]
        dX /= length
        dY /= length
        return [ dX*factor, dY*factor][fGetY]
      if(element[0] == TYPE_spring):
        sX = Y[element[1]*4+0]
        sY = Y[element[1]*4+2]
        eX = Y[element[2]*4+0]
        eY = Y[element[2]*4+2]
        length = sqrt( (eX-sX)**2 + (eY-sY)**2)
    #    print "Length " + str(length)
    #    print "Y " + str(fGetY) + " element[1] " + str(element[1]) + " element[2] "+str(element[2])
#        if(length<element[3]):
#          return 0
        factor = (length-element[3])/length*direction*element[4]
    #    print ["Spring", (eX-sX)*factor, (eY-sY)*factor];
        return [ (eX-sX)*factor, (eY-sY)*factor][fGetY];
      if(element[0] == TYPE_viscous):
        dX = Y[element[2]*4+0]-Y[element[1]*4+0]
        dY = Y[element[2]*4+2]-Y[element[1]*4+2]
        dVx = Y[element[2]*4+1]-Y[element[1]*4+1]
        dVy = Y[element[2]*4+3]-Y[element[1]*4+3]
        length = sqrt(dX**2+dY**2)
        dX /= length
        dY /= length
        scalar = dVx*dX+dVy*dY
        factor = element[3]*direction*scalar
    #    print ["Damping", (eX-sX)*factor, (eY-sY)*factor]
        return [ dX*factor, dY*factor][fGetY]
      return 0;
    
    def F(self, X, Y):
      Z = zeros(len(Y))
      
      for j in range(0, len(Y)//2):
        if self.point_types[j/2] == POINT_static:
            continue
        Z[j*2+0] = Y[j*2+1]
        #print str(j/2) + "  " + str(j%2)
        for el in self.equations[j/2]:
          Z[j*2+1] += self.Eval_Elem(X, Y, el[0], el[1], j%2);
      
      return Z;
      
    def F2(self, X, Y):
      Z = zeros(len(Y))
      
      for j in range(0, len(Y)//2):
        if self.point_types[j//2] == POINT_static:
            continue
        for el in self.equations[j//2]:
          Z[j*2+1] += self.Eval_Elem(X, Y, el[0], el[1], j%2);
        Z[j*2+0] = Z[j*2+1]
        Z[j*2+1] -= Y[j*2+1]
      
      return Z;
      
    def RungeKutta(self):
      X = 0
      Y = self.points
      while X < self.end_time:
        K1 = self.F(X, Y)*self.h        # with array result
        K2 = self.F(X + self.h/2, Y + K1/2)*self.h
        K3 = self.F(X + self.h/2, Y + K2/2)*self.h
        K4 = self.F(X + self.h, Y + K3)*self.h
        Y  = Y + (K1 + 2 * K2 + 2 * K3 + K4) / 6
        X += self.h
        self.all_points.append(Y);
      return
      
    def Euler(self):
      X2 = 0
      Y = self.points
      while X2 < self.end_time:
        Y  = Y + self.F(X2, Y)*self.h
        X2 += self.h;
        self.all_points.append(Y)
      return
      
    def Overdamed(self):
      X2 = 0
      Y = self.points
      while X2 < self.end_time:
        Y  = Y + self.F2(X2, Y)*self.h
        X2 += self.h;
        self.all_points.append(Y)
      return
    
    def plot_points(self, index, subplot):
      x = []
      y = []
      x2 = []
      y2 = []
      for j in range(0,len(self.all_points[index])//4):
        if self.point_types[j] == POINT_dynamic:
          x.append(self.all_points[index][j*4+0])
          y.append(self.all_points[index][j*4+2])
        if self.point_types[j] == POINT_static:
          x2.append(self.all_points[index][j*4+0])
          y2.append(self.all_points[index][j*4+2])
      subplot.plot(x,y,"bo")
      subplot.plot(x2,y2,"ro")
      
    def get_point(self,index,i):
        return [self.all_points[index][i*4+0], self.all_points[index][i*4+2]]
      
    def plot_elements(self, index, subplot):
      for element in self.elements:
        if(element[1] >= len(self.all_points[index])/4 or element[2] >= len(self.all_points[index])/4):
          continue
        if(element[0] == TYPE_spring or element[0] == TYPE_WLCspring):
          self.plot_spring(subplot, self.get_point(index, element[1]), self.get_point(index, element[2]), element[3], element[5]);
        if(element[0] == TYPE_viscous):
          self.plot_viscous(subplot, self.get_point(index, element[1]), self.get_point(index, element[2]), element[5]);
        if element[0] == TYPE_force and (index==0 or (element[4][0]<index*self.h and element[4][1]>index*self.h)):
          self.plot_force(subplot, self.get_point(index, element[1]), element[3]);
        if element[0] == TYPE_SinForce and (index==0 or (element[4][0]<index*self.h and element[4][1]>index*self.h)):
          self.plot_force(subplot, self.get_point(index, element[1]), element[3]);
          
    def plot_force(self, subplot, start, direction):
      x = [start[0]]; y = [start[1]];
      offX = start[0]; offY = start[1];
      distX = direction[0]; distY = direction[1];
      distance = sqrt(distX**2 + distY**2)
      normX = -distY/distance; normY = distX/distance;
      tanX = distX/distance; tanY = distY/distance;
      x.append(offX+distX);
      y.append(offY+distY);
      x.append(offX+distX+normX*0.1-tanX*0.1);
      y.append(offY+distY+normY*0.1-tanY*0.1);
      x.append(offX+distX-tanX*0.1);
      y.append(offY+distY-tanY*0.1);
      x.append(offX+distX-normX*0.1-tanX*0.1);
      y.append(offY+distY-normY*0.1-tanY*0.1);
      x.append(offX+distX);
      y.append(offY+distY);
      subplot.plot(x,y,'r-')
      
    def plot_spring(self, subplot, start, end, l, offset):
      x = [start[0]]; y = [start[1]];
      offX = start[0]; offY = start[1];
      distX = end[0]-start[0]; distY = end[1]-start[1];
      distance = sqrt(distX**2 + distY**2)
      normX = -distY/distance; normY = distX/distance;
      count = int(l/0.1);
      direction = 1
#      offset = 0.15
      for i in range(0, count):
        x.append(offX + distX*(i+0.5)/count + normX*direction*0.1 + normX*offset);
        y.append(offY + distY*(i+0.5)/count + normY*direction*0.1 + normY*offset);
        if(direction == 1):
          direction = -1
        else:
          direction = 1
      x.append(end[0]);
      y.append(end[1]);
      subplot.plot(x,y,'g-')
      
    def plot_viscous(self, subplot, start, end, offset):
      width = 0.1
      start_dist = 0.2
      end_dist = 0.2
      hole_dist = 0.4
#      offset = -0.15
      
      offX = start[0]; offY = start[1];
      distX = end[0]-start[0]; distY = end[1]-start[1];
      distance = sqrt(distX**2 + distY**2)
      normX = -distY/distance; normY = distX/distance;
      tanX = distX/distance; tanY = distY/distance;
      x = [offX]; y = [offY];
      x.append(offX +tanX*start_dist + normX*offset); y.append(offY +tanY*start_dist + normY*offset);
      subplot.plot(x,y,'g-')
      x = [offX + tanX*start_dist + normX*offset]; y = [offY + tanY*start_dist + normY*offset];
      x.append(offX + tanX*start_dist + normX*0.1 + normX*offset);
      y.append(offY + tanY*start_dist + normY*0.1 + normY*offset);
      x.append(offX + normX*0.1 + distX - tanX*end_dist + normX*offset);
      y.append(offY + normY*0.1 + distY - tanY*end_dist + normY*offset);
      subplot.plot(x,y,'g-')
      x = [offX + tanX*start_dist + normX*offset]; y = [offY + tanY*start_dist + normY*offset];
      x.append(offX + tanX*start_dist - normX*0.1 + normX*offset);
      y.append(offY + tanY*start_dist - normY*0.1 + normY*offset);
      x.append(offX - normX*0.1 + distX - tanX*end_dist + normX*offset);
      y.append(offY - normY*0.1 + distY - tanY*end_dist + normY*offset)
      subplot.plot(x,y,'g-')
      x = [offX+tanX*hole_dist + normX*offset]; y = [offY+tanY*hole_dist + normY*offset];
      x.append(offX+distX-tanX*end_dist + normX*offset); y.append(offY+distY-tanY*end_dist + normY*offset);
      x.append(offX + distX); y.append(offY + distY);
      subplot.plot(x,y,'g-')
      
      
    def plotCurve(self, index, coord, subplot, time, typ):
      x = []; y = []; z = [];
      time_value = 0;
      i = 0;
      #print all_points
      for Y in self.all_points:
        if(i*self.h <= time):
          time_value = Y[index*4+coord]
        x.append(i*self.h)
        y.append( Y[index*4+0])#(all_points[i][2*4+2]-all_points[i-1][2*4+2])/h);
      # y.append(sqrt(Y[2*4+0]**2+Y[2*4+2]**2));
      #  z.append(point[2]);
        z.append( Y[index*4+coord]);
        #z.append(arctan2(Y[2*4+2],Y[2*4+0]));
      #  z.append(points[2][i][1]);
        i+=1
      if typ == "normal":
        subplot.plot(x,z,'-');
        subplot.plot(time, time_value, 'bo')
      if typ == "loglog":
        subplot.loglog(x,z,'-');
        subplot.loglog(time, time_value, 'bo')
        
    def plotHoldCurve(self, curve, subplot, typ):
      if typ == "normal":
        subplot.plot(curve[0],curve[1],'-');
      if typ == "loglog":
        subplot.loglog(curve[0],curve[1],'-');
      

    def getCurve(self, index, coord, subplot, time, typ):
      x = []; y = []; z = [];
      time_value = 0;
      i = 0;
      #print all_points
      for Y in self.all_points:
        if(i*self.h <= time):
          time_value = Y[index*4+coord]
        x.append(i*self.h)
        y.append( Y[index*4+0])#(all_points[i][2*4+2]-all_points[i-1][2*4+2])/h);
      # y.append(sqrt(Y[2*4+0]**2+Y[2*4+2]**2));
      #  z.append(point[2]);
        z.append( Y[index*4+coord]);
        #z.append(arctan2(Y[2*4+2],Y[2*4+0]));
      #  z.append(points[2][i][1]);
        i+=1
      return [x,z]