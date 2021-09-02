(window.webpackJsonp=window.webpackJsonp||[]).push([[62],{356:function(e,n,t){"use strict";t.r(n),n.default="# An Example: Implement Dragging\n\nThis is a tiny example, introducing how to implement dragging of graphic elements in Apache ECharts<sup>TM</sup>. From this example, we will see how to make an application with rich intractivity based on echarts API.\n\n<md-example src=\"line-draggable\" height=\"400\"></md-example>\n\nThis example mainly implements that dragging points of a curve and by which the curve is modified. Although it is simple example, but we can do more based on that, like edit charts viually. So let's get started from this simple example.\n\n## Implement basic dragging\n\nFirst of all, we create a basic [line chart (line series)](${optionPath}series-line):\n\n```js\nvar symbolSize = 20;\nvar data = [\n  [15, 0],\n  [-50, 10],\n  [-56.5, 20],\n  [-46.5, 30],\n  [-22.1, 40]\n];\n\nmyChart.setOption({\n  xAxis: {\n    min: -100,\n    max: 80,\n    type: 'value',\n    axisLine: { onZero: false }\n  },\n  yAxis: {\n    min: -30,\n    max: 60,\n    type: 'value',\n    axisLine: { onZero: false }\n  },\n  series: [\n    {\n      id: 'a',\n      type: 'line',\n      smooth: true,\n      // Set a big symbolSize for dragging convenience.\n      symbolSize: symbolSize,\n      data: data\n    }\n  ]\n});\n```\n\nSince the symbols in line is not draggable, we make them draggable by using [graphic component](${optionPath}graphic) to add draggable circular elements to symbols respectively.\n\n```js\nmyChart.setOption({\n  // Declare a graphic component, which contains some graphic elements\n  // with the type of 'circle'.\n  // Here we have used the method `echarts.util.map`, which has the same\n  // behavior as Array.prototype.map, and is compatible with ES5-.\n  graphic: echarts.util.map(data, function(dataItem, dataIndex) {\n    return {\n      // 'circle' means this graphic element is a shape of circle.\n      type: 'circle',\n\n      shape: {\n        // The radius of the circle.\n        r: symbolSize / 2\n      },\n      // Transform is used to located the circle. position:\n      // [x, y] means translate the circle to the position [x, y].\n      // The API `convertToPixel` is used to get the position of\n      // the circle, which will introduced later.\n      position: myChart.convertToPixel('grid', dataItem),\n\n      // Make the circle invisible (but mouse event works as normal).\n      invisible: true,\n      // Make the circle draggable.\n      draggable: true,\n      // Give a big z value, which makes the circle cover the symbol\n      // in line series.\n      z: 100,\n      // This is the event handler of dragging, which will be triggered\n      // repeatly while dragging. See more details below.\n      // A util method `echarts.util.curry` is used here to generate a\n      // new function the same as `onPointDragging`, except that the\n      // first parameter is fixed to be the `dataIndex` here.\n      ondrag: echarts.util.curry(onPointDragging, dataIndex)\n    };\n  })\n});\n```\n\nIn the code above, API [convertToPixel](api.html#echartsInstance.convertToPixel) is used to convert data to its \"pixel coodinate\", based on which each graphic elements can be rendered on canvas. The term \"pixel coodinate\" means the coordinate is in canvas pixel, whose origin is the top-left of the canvas. In the sentence `myChart.convertToPixel('grid', dataItem)`, the first parameter `'grid'` indicates that `dataItem` should be converted in the first [grid component (cartesian)](${optionPath}grid).\n\n**Notice:** `convertToPixel` should not be called before the first time that `setOption` called. Namely, it can only be used after coordinate systems (grid/polar/...) initialized.\n\nNow points have been made draggable. Then we will bind event listeners on dragging to those points.\n\n```js\n// This function will be called repeatly while dragging.\n// The mission of this function is to update `series.data` based on\n// the new points updated by dragging, and to re-render the line\n// series based on the new data, by which the graphic elements of the\n// line series can be synchronized with dragging.\nfunction onPointDragging(dataIndex) {\n  // Here the `data` is declared in the code block in the beginning\n  // of this article. The `this` refers to the dragged circle.\n  // `this.position` is the current position of the circle.\n  data[dataIndex] = myChart.convertFromPixel('grid', this.position);\n  // Re-render the chart based on the updated `data`.\n  myChart.setOption({\n    series: [\n      {\n        id: 'a',\n        data: data\n      }\n    ]\n  });\n}\n```\n\nIn the code above, API [convertFromPixel](api.html#echartsInstance.convertFromPixel) is used, which is the reversed process of [convertToPixel](api.html#echartsInstance.convertToPixel). `myChart.convertFromPixel('grid', this.position)` converts a pixel coordinate to data item in [grid (cartesian)](${optionPath}grid).\n\nFinally, add those code to make graphic elements responsive to change of canvas size.\n\n```js\nwindow.addEventListener('resize', function() {\n  // Re-calculate the position of each circle and update chart using `setOption`.\n  myChart.setOption({\n    graphic: echarts.util.map(data, function(item, dataIndex) {\n      return {\n        position: myChart.convertToPixel('grid', item)\n      };\n    })\n  });\n});\n```\n\n## Add tooltip component\n\nNow basic functionality have been implemented by parte 1. If we need the data can be displayed realtime when dragging, we can use [tooltip component](${optionPath}tooltip) to do that. Nevertheless, tooltip component has its default \"show/hide rule\", which is not applicable in this case. So we need to customize the \"show/hide rule\" for our case.\n\nAdd these snippets to the code block above:\n\n```js\nmyChart.setOption({\n  // ...,\n  tooltip: {\n    // Means disable default \"show/hide rule\".\n    triggerOn: 'none',\n    formatter: function(params) {\n      return (\n        'X: ' +\n        params.data[0].toFixed(2) +\n        '<br>Y: ' +\n        params.data[1].toFixed(2)\n      );\n    }\n  }\n});\n```\n\n```js\nmyChart.setOption({\n  graphic: data.map(function(item, dataIndex) {\n    return {\n      type: 'circle',\n      // ...,\n      // Customize \"show/hide rule\", show when mouse over, hide when mouse out.\n      onmousemove: echarts.util.curry(showTooltip, dataIndex),\n      onmouseout: echarts.util.curry(hideTooltip, dataIndex)\n    };\n  })\n});\n\nfunction showTooltip(dataIndex) {\n  myChart.dispatchAction({\n    type: 'showTip',\n    seriesIndex: 0,\n    dataIndex: dataIndex\n  });\n}\n\nfunction hideTooltip(dataIndex) {\n  myChart.dispatchAction({\n    type: 'hideTip'\n  });\n}\n```\n\nThe API [dispatchAction](${mainSitePath}/api.html#echartsInstance.dispatchAction) is used to show/hide tooltip content, where actions [showTip](${mainSitePath}/api.html#action.tooltip.showTip) and [hideTip](api.html#action.tooltip.hideTip) is dispatched.\n\n## Full code\n\nFull code is shown as follow:\n\n```js\nimport echarts from 'echarts';\n\nvar symbolSize = 20;\nvar data = [\n  [15, 0],\n  [-50, 10],\n  [-56.5, 20],\n  [-46.5, 30],\n  [-22.1, 40]\n];\nvar myChart = echarts.init(document.getElementById('main'));\nmyChart.setOption({\n  tooltip: {\n    triggerOn: 'none',\n    formatter: function(params) {\n      return (\n        'X: ' +\n        params.data[0].toFixed(2) +\n        '<br />Y: ' +\n        params.data[1].toFixed(2)\n      );\n    }\n  },\n  xAxis: { min: -100, max: 80, type: 'value', axisLine: { onZero: false } },\n  yAxis: { min: -30, max: 60, type: 'value', axisLine: { onZero: false } },\n  series: [\n    { id: 'a', type: 'line', smooth: true, symbolSize: symbolSize, data: data }\n  ]\n});\nmyChart.setOption({\n  graphic: echarts.util.map(data, function(item, dataIndex) {\n    return {\n      type: 'circle',\n      position: myChart.convertToPixel('grid', item),\n      shape: { r: symbolSize / 2 },\n      invisible: true,\n      draggable: true,\n      ondrag: echarts.util.curry(onPointDragging, dataIndex),\n      onmousemove: echarts.util.curry(showTooltip, dataIndex),\n      onmouseout: echarts.util.curry(hideTooltip, dataIndex),\n      z: 100\n    };\n  })\n});\nwindow.addEventListener('resize', function() {\n  myChart.setOption({\n    graphic: echarts.util.map(data, function(item, dataIndex) {\n      return { position: myChart.convertToPixel('grid', item) };\n    })\n  });\n});\nfunction showTooltip(dataIndex) {\n  myChart.dispatchAction({\n    type: 'showTip',\n    seriesIndex: 0,\n    dataIndex: dataIndex\n  });\n}\nfunction hideTooltip(dataIndex) {\n  myChart.dispatchAction({ type: 'hideTip' });\n}\nfunction onPointDragging(dataIndex, dx, dy) {\n  data[dataIndex] = myChart.convertFromPixel('grid', this.position);\n  myChart.setOption({\n    series: [\n      {\n        id: 'a',\n        data: data\n      }\n    ]\n  });\n}\n```\n\nWith knowledge introduced above, more feature can be implemented. For example, [dataZoom component](${optionPath}dataZoom) can be added to cooperate with the cartesian, or we can make a plotting board on coordinate systems. Use your imagination ~\n"}}]);