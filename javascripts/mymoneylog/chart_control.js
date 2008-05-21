/**
 * chart_control.js - chart controller
 * @author Ricardo Nishimura - 2008
 */
mlog.chartControl = function() {
  return {
    show: function(data) {
      if (!data) {
        return;
      }
      var showDebits = eval($('#drawValuesKind').val());
      var xTicks = []; // x labels
      var i = 0;
      var list;
      var strDataset = '[';
      var count = 0;
      var chartTitle = '';
      /* get selected categories */
      var categoriesChecked = [];
      $.each($('#show_ov_categories input:checked'), function() {
        categoriesChecked.push($(this).attr('title'));
      });

      /* build x labels */
      /* as: [[0, '2008-01'],[1, '2008-02']]... */
      var str = '[';
      for (var month in data.summary[mlog.translator.get('balance')]) {
        str += '['+count+', "'+month+'"],';
        count++;
      }
      str = str.slice(0,str.length-1) + ']';
      xTicks = eval(str);

      // if any category selected: draw category chart
      if (categoriesChecked.length>0) {
        list = data.categories;
        chartTitle = showDebits?mlog.translator.get('expenses by category'):mlog.translator.get('credits by category');
        for (var category in list) {
          /* if not checked skip */
          if ($.inArray(category,categoriesChecked)<0) continue;
          i++;
          strDataset += '{label: "'+category+'", data: [';
          count = 0;
          str = '';
          /* build category month's values */
          /* eg: [[0,100],[1,95]], ... */
          var tmpValue=0;
          for (var month in list[category]) {
            tmpValue = Math.round(list[category][month]);
            tmpValue = tmpValue * (showDebits?-1:1)
            // just display debits
            tmpValue = (tmpValue>0)?tmpValue:0;
            str += '['+count+', '+tmpValue+'],';
            count++;
          }
          strDataset += str.slice(0,str.length-1) + ']},';
        }
      } else {
        // draw summary chart
        list = data.summary;
        chartTitle = mlog.translator.get('overview chart');
        for (var description in list) {
          i++;
          strDataset += '{label: "'+description+'", data: [';
          count = 0;
          str = '';
          /* build category month's values */
          /* eg: [[0,100],[1,95]], ... */
          var tmpValue=0;
          // if debit show value as positive
          if (description == mlog.translator.get('debit')) {
            showDebits=true;
          } else {
            showDebits=false;
          }
          for (var month in list[description]) {
            tmpValue = Math.round(list[description][month]);
            tmpValue = tmpValue * (showDebits?-1:1)
            // just display debits
            //tmpValue = (tmpValue>0)?tmpValue:0;
            str += '['+count+', '+tmpValue+'],';
            count++;
          }
          strDataset += str.slice(0,str.length-1) + ']},';
        }
      }
      strDataset = strDataset.slice(0,strDataset.length-1) + ']';
      // Define a dataset.
      var dataset = [];
      eval('dataset = '+strDataset+';');

      // chart container
      var size = $('#chart').width()-25;
      $('#chart').html('<h1>'+ chartTitle +
        '</h1><div id="chart_canvas" style="height:'+
        (size/1.75)+'px; width:'+(size)+'px;"></div>');

      // draw
      $.plot($('#chart_canvas'),
              dataset,
              {
                xaxis: {ticks: xTicks},
                legend: {margin:10,noColumns:2,backgroundOpacity:0.4}
              }
            );
    }
  }
}();
