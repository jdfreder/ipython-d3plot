import os
from operator import add
from functools import reduce

from IPython.html import widgets # Widget definitions
from IPython.utils.traitlets import Unicode, CInt, List, Bool, Any
from IPython.display import display, Javascript

def get_static_path():
    return os.path.join(os.path.split(__file__)[0], 'static')

def publish_stackedarea_js():
    with open(os.path.join(get_static_path(), 'stackedarea.js'), 'r') as f:
        display(Javascript(data=f.read()))


# Define our ForceDirectedGraphWidget and its target model and default view.
class StackedAreaWidget(widgets.DOMWidget):
    _view_name = Unicode('D3StackedAreaView', sync=True)
    
    width = Any(400, sync=True)
    height = Any(300, sync=True)
    data = Unicode(sync=True)
    hide_xaxis = Bool(False, sync=True)
    
    _values = List([], sync=True)
    _line_values = List([], sync=True)
    _scale = List([(0, 10), (10, 0)], sync=True)

    def clear(self):
        self._values = []

    def get_layer(self, name, line=False):
        name = name.lower().strip()
        for layer in (self._line_values if line else self._values):
            if layer['name'].lower().strip() == name:
                return layer
        return None

    def remove_layer(self, name):
        if name is not None:
            name = name.lower().strip()
            values = [v for v in self._values if v['name'].lower().strip() != name]
            line_values = [v for v in self._line_values if v['name'].lower().strip() != name]
            self._scale = self._calc_scale(values, line_values)
            self._values = values
            self._line_values = line_values
            self.send_state()

    def add_layer(self, name, line=False, **kwargs):
        self.remove_layer(name)
        if line:
            values = self._line_values
            value = {'name': name}
            value.update(kwargs)
            values.append(value)
            self._scale = self._calc_scale(self._values, values)
            self._line_values = values
        else:
            values = self._values
            value = {'name': name}
            value.update(kwargs)
            values.append(value)
            self._scale = self._calc_scale(values, self._line_values)
            self._values = values
        self.send_state()

    def set_layer(self, name, line=None, **kwargs):
        if line is None or not line:
            layer = self.get_layer(name)
            if layer is not None:
                layer.update(kwargs)
                self._scale = self._calc_scale(self._values, self._line_values)
                self.send_state()
                return
        if line is None or line:
            layer = self.get_layer(name, line=True)
            if layer is not None:
                layer.update(kwargs)
                self._scale = self._calc_scale(self._values, self._line_values)
                self.send_state()
                return

        self.add_layer(name, line=line, **kwargs)

    def _calc_scale(self, values, line_values):
        if len(values) > 0:
            x_values = [pt[0] for pts in values+line_values for pt in pts['values']]
            y_values = [pt[1] for pts in values+line_values for pt in pts['values']]
            y_max = reduce(max,[pt[1] for pts in line_values for pt in pts['values']] + [reduce(add, group) for group in zip(*[[pt[1] for pt in pts['values']] for pts in values])])
            y_min = reduce(min,[pt[1] for pts in line_values for pt in pts['values']] + [reduce(add, group) for group in zip(*[[pt[1] for pt in pts['values']] for pts in values])])
            #y_max = reduce(add, [reduce(max, [pt[1] for pt in pts['values']]) for pts in values])
            return [(min(x_values), max(x_values)), (reduce(max, [y_max,0] + y_values), reduce(min, [y_min,0] + y_values))]
        else:
            return [(0, 10), (0, 10)]
