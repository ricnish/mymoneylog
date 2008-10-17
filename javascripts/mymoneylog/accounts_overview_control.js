/**
 * overview_control.js - overview controller
 * @author Ricardo Nishimura - 2008
 */
mlog.accountsControl = function() {
  var htmlTemplate = null;
  var hideOverview = false;
  return {
    init: function() {
      /* initialize template... */
      if (!htmlTemplate) {
        var overviewTemplate = {};
        /* trying to not generate any new markup, just get from html */
        /* break table rows */
        rows = $('#accounts_overview_table').html().replace(/<\/tr>/gi, '</tr>!*!');
        rows = rows.replace(/  /gi,'');
        rows = rows.split('!*!');
        for (var i=0;i<rows.length;i++) {
          rows[i] = rows[i].replace(/<\/td>/i,'</td>!*!');
          rows[i] = rows[i].replace(/<\/th>/i,'</th>!*!');
          rows[i] = rows[i].split('!*!');
        }
        /* remove nodes inside entries table */
        $("#accounts_overview_table tbody").remove();
        /* entries table: append a template hook */
        $('#accounts_overview_table').append(document.createTextNode("{overviewContent}"));
        overviewTemplate = {
          tHeadLabel: rows[0][0],
          tHeadColumn: (rows[0][1]).replace(/<\/tr>/i,''),
          tRowLabel: rows[1][0],
          tRowOddLabel: (rows[1][0]).replace(/row-a/,'row-b'),
          tRowColumn: (rows[1][1]).replace(/<\/tr>/i,'')
        };
        htmlTemplate = {
          overview: overviewTemplate,
          main: $('#main_accounts_overview').html()
        };
        $('#main_accounts_overview').html('');
        /* initialize datepicker */
        Calendar.setup({
          inputField: "input_accounts_until_date",
          ifFormat: "%Y-%m-%d",
          weekNumbers: false
        });
        /* initial date value */
        $('#input_accounts_until_date').val(mlog.base.getCurrentDate());
      }
    },
    /* show overview */
    updateView: function() {
      /* get selected accounts */
      var accountsList = [];
      $.each($('#show_ov_accounts .tagSelect'), function(i,v) {
        accountsList.push($(v).html());
      });
      var theData = null;
      theData = mlog.entries.getAccountsOverview( parseInt($('#accountsNumberMonths').val())-1,
        $('#input_accounts_until_date').val(),
        accountsList);
      var res = [];
      var str = '<h1>' + mlog.translator.get('no data') + '</h1>';
      var odd = true;
      if (theData!==null) {
//        theData.reverse();
        /* build header */
        res.push(htmlTemplate.overview.tHeadLabel);
        for (var i=0;i<theData[0][1].length;i++) {
          str = htmlTemplate.overview.tHeadColumn.replace(/{account}/,theData[0][1][i][0]);
          res.push(str);
        }
        res.push('</tr>'); // closing tag
        /* build accounts rows */
        for (var i=0;i<theData.length;i++) {
          str = odd?htmlTemplate.overview.tRowOddLabel:htmlTemplate.overview.tRowLabel;
          odd = !odd;
          str = str.replace(/{date}/,theData[i][0]);
          res.push(str);
          /* build values */
          str = htmlTemplate.overview.tRowColumn;
          avgSum = 0;
          avgCount = 0;
          for (var y=0;y< theData[i][1].length;y++) {
            res.push(str.replace(/{value}/,mlog.base.formatFloat(theData[i][1][y][1])));
          }
          res.push('</tr>'); // closing tag
        }
        str = htmlTemplate.main;
        str = str.replace(/{overviewContent}/,res.join(''));
      }
      $('#report').html(str);
      res = null;
      /* display the chart */
      mlog.accountsControl.drawChart(theData);
      /* hide/show function */
      $('#accounts_chart_title').click( function() {
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
        hideOverview = !hideOverview;
      });
    },
    updateTagCloud: function() {
      $('#show_ov_accounts').html(mlog.base.arrayToTagCloud(mlog.accounts.getAllwithTotal(),2));
      $('#show_ov_accounts .tagCloud').click(function(v) {
        mlog.base.toggleTag(v);
        mlog.accountsControl.updateView();
      });
    },
    toggleAllTagCloud: function(el) {
      mlog.base.toggleAllTagCloud(el);
      mlog.accountsControl.updateView();
    },
    show: function() {
      mlog.accountsControl.init();
      mlog.base.activateMenu('accounts_overview');
      $('#panel_accounts_overview .selectAll').removeClass("tagSelect");
      mlog.accountsControl.updateTagCloud();
      mlog.accountsControl.toggleAllTagCloud($('#panel_accounts_overview .selectAll'));
    },
    drawChart: function(data) {
      if (data===null) {
        return;
      }
      var xTicks = []; // x labels
      var i = 0;
      var strDataset = '[';
      var chartTitle = mlog.translator.get('diary balance');

      /* build x labels */
      /* as: [[0, '10-01'],[1, '10-02']]... month-day */
      var str = '[';
      var nTicks = Math.round(data.length/12);
      for (i=0;i<data.length;i+=nTicks) {
        str += '['+i+', "'+data[i][0].slice(5,10)+'"],';
      }
      str = str.slice(0,str.length-1) + ']';
      xTicks = eval(str);

      // if any category selected: draw line category chart
      for (i=0;i<data[0][1].length;i++) {
        /* if not checked skip */
        strDataset += '{label: "'+data[0][1][i][0]+'", data: [';
        str = '';
        /* build account's day values */
        /* eg: [[0,100],[1,95]], ... */
        for (var n=0;n<data.length;n++) {
          str += '['+n+', '+data[n][1][i][1]+'],';
        }
        strDataset += str.slice(0,str.length-1) + ']},';
      }
      strDataset = strDataset.slice(0,strDataset.length-1) + ']';
      // Define a dataset.
      var dataset = [];
      eval('dataset = '+strDataset+';');

      // chart container
      chartTitle = mlog.translator.get('chart')+': '+chartTitle;
      var size = $('#accounts_chart').width()-25;
      $('#accounts_chart').html('<h1 id="accounts_chart_title" class="msg show_next">'+ chartTitle +
        '</h1><div id="chart_canvas" style="height:'+
        (size/1.75)+'px; width:'+(size)+'px;"></div>');

      // draw
      $.plot($('#chart_canvas'),
        dataset,
        {
          xaxis: {ticks: xTicks},
          legend: {margin:10,noColumns:2,backgroundOpacity:0.4},
          colors: ["#edc240","#afd8f8","#cb4b4b","#4da74d","#9440ed",'#808080','#808000','#008080','#0000FF','#00FF00','#800080','#FF00FF','#800000','#FF0000','#FFFF00','#FF8C0','#FFA07A','#D2691E','#DDA0DD','#ADFF2F','#4B0082','#FFFFA0','#00FF7F','#BDB76B','#B0C4DE','#00FFFF','#008000','#000080','#C0C0C0']
        }
      );
    }
  }
}();
