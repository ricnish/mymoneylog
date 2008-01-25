mlog.chartControl = function() {
  var palete = [
    '#00FFFF',
    '#008000',
    '#000080',
    '#C0C0C0',
    '#000000',
    '#808080',
    '#808000',
    '#008080',
    '#0000FF',
    '#00FF00',
    '#800080',
    '#FF00FF',
    '#800000',
    '#FF0000',
    '#FFFF00',
    '#FF8C00',
    '#FFA07A',
    '#D2691E',
    '#DDA0DD',
    '#ADFF2F',
    '#4B0082',
    '#FFFFA0',
    '#00FF7F',
    '#BDB76B',
    '#B0C4DE'
    ];

  return {
    show: function(data) {
      if (!data) {
        return;
      }
      var ticks = []; // x labels
      var i = 0;
      var list = data.categories;
      var strDataset = '{';
      var strPalete = '{';
      var count = 0;
      for (var category in list) {
        if (i == 0) {
          /* build x labels */
          /* as: [{v:0, label:'2008-01'},{v:1, label:'2008-02'}]... */
          var str = '[';
          for (var month in list[category]) {
            str += '{v:'+count+', label:"'+month+'"},';
            count++;
          }
          str = str.slice(0,str.length-1) + ']';
          ticks = eval(str);
        }
        i++;
        strDataset += '"'+category+'":[';

        count = 0;
        str = '';
        /* build category month's values */
        /* as: category: [[0,100],[1,95]], ... */
        for (var month in list[category]) {
          str += '['+count+', '+Math.round(list[category][month]*-1)+'],';
          count++;
        }
        strDataset += str.slice(0,str.length-1) + '],';

        // build color palete
        strPalete += '"'+category +'":"'+palete[i]+'",';
      }
      strDataset = strDataset.slice(0,strDataset.length-1) + '}';
      strPalete = strPalete.slice(0,strPalete.length-1) + '}';
      var colorHash = eval('new Hash('+strPalete+')');
      // Define a dataset.
      var dataset = {};
      eval('dataset = '+strDataset+';');

      // chart container
      var size = $('chart').getWidth()-140;
      $('chart').innerHTML = '<h1>'+ mlog.translator.get('expenses by category') +
        '</h1><div><canvas id="chart_canvas" height="'+
        (size/2)+'" width="'+
        (size)+'"></canvas></div>';

      // Define options.
      var options = {
        // Define a padding for the canvas node
        padding: {
          left: 50,
          right: 0,
          top: 10,
          bottom: 30
        },
        // Background color to render.
        background: {
          color: '#f0f0f0'
        },
        shouldFill: false,
        // Use the predefined blue colorscheme.
        colorScheme: colorHash,
        axis: {
          // The fontcolor of the labels is black.
          labelColor: '#000000',
          // Add the ticks. Keep in mind, x and y axis are swapped
          // when the BarOrientation is horizontal.
          x: {
            ticks: ticks
          }
        },
        // Set the legend position.
        legend: {
          position:{
            left: (size+24)+'px'
          }
        }
      };

      // Instantiate a new LineCart.
      var line = new Plotr.LineChart('chart_canvas',options);
      // Add a dataset to it.
      line.addDataset(dataset);
      // Render it.
      line.render();
    }
  }
}();
