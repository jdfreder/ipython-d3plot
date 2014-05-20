ipython-d3plot
==============

An IPython Widget for D3 Plots.

Currently only implements stacked area plots.

To run from the IPython Notebook with an internet connection:

```python
from d3plot import stackedarea
from d3plot import initialize_notebook
initialize_notebook()
```

To run without an internet connection, first install the JavaScript and CSS files
in `$HOME/.ipython/nbextensions` by running this script in the source tree of this repository:

```bash
python install-nbextension.py
```

Then call `initialize_notebook` as follows:


```python
from d3plot import stackedarea
from d3plot import initialize_notebook
initialize_notebook(d3_url='/nbextensions/d3/3.4.7')
```
