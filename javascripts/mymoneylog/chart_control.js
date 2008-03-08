mlog.chartControl = function() {
  return {
    show: function(data) {
      if (!data) {
        return;
      }
      var xTicks = []; // x labels
      var i = 0;
      var list = data.categories;
      var strDataset = '[';
      var count = 0;
      for (var category in list) {
        if (i == 0) {
          /* build x labels */
          /* as: [[0, '2008-01'],[1, '2008-02']]... */
          var str = '[';
          for (var month in list[category]) {
            str += '['+count+', "'+month+'"],';
            count++;
          }
          str = str.slice(0,str.length-1) + ']';
          xTicks = eval(str);
        }
        i++;
        strDataset += '{label: "'+category+'", data: [';
        count = 0;
        str = '';
        /* build category month's values */
        /* eg: [[0,100],[1,95]], ... */
        var tmpValue=0;
        for (var month in list[category]) {
          tmpValue = Math.round(list[category][month]*-1);
          // just display debits
          tmpValue = (tmpValue>0)?tmpValue:0;
          str += '['+count+', '+tmpValue+'],';
          count++;
        }
        strDataset += str.slice(0,str.length-1) + ']},';
      }
      strDataset = strDataset.slice(0,strDataset.length-1) + ']';
      // Define a dataset.
      var dataset = [];
      eval('dataset = '+strDataset+';');

      // chart container
      var size = $('chart').getWidth()-20;
      $('chart').innerHTML = '<h1>'+ mlog.translator.get('expenses by category') +
        '</h1><div id="chart_canvas" style="height:'+
        (size/2)+'px; width:'+(size)+'px;"></div>';

      // draw
      var line = Flotr.draw($('chart_canvas'),
                            dataset,
                            {
                              xaxis: {ticks: xTicks},
                              legend: {margin:10,noColumns:2,backgroundOpacity:0.4}
                            }
                            );
    }
  }
}();
