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
        //var list = theData.accounts;
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
        if (hideOverview) {
          /* apply hide style */
          str = str.replace(/show_next/, 'hide_next');
          str = str.replace(/id="accounts_overview_summary"/i, 'id="accounts_overview_summary" style="display: none"');
        }
        str = str.replace(/{overviewContent}/,res.join(''));
      }
      $('#report').html(str);
      res = null;
      /* hide/show overview table */
      $('#toggle_accounts_overview_table').click( function() {
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
        hideOverview = !hideOverview;
      });
      /* display the chart */
//      mlog.accountsControl.drawChart(theData);
    },
    updateTagCloud: function() {
      var acc = mlog.accounts.getAll();
      acc.pop(); // remove total
      $('#show_ov_accounts').html(mlog.base.arrayToTagCloud(acc,2));
      $('#show_ov_accounts .tagCloud').click(function(v) {
        mlog.base.toggleTag(v);
        mlog.accountsControl.updateView();
      });
    },
    toggleAllTagCloud: function(el) {
      var elem = $(el);
      mlog.base.toggleTag(elem);
      var chk = elem.hasClass("tagSelect");
      $.each(elem.next().children(), function(i,v) {
        $(v).removeClass("tagSelect");
        if (chk) $(v).addClass("tagSelect");
      });
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
      if (data==null) {
        return;
      }
      var chartSelection = $('#chartSelection').val();
      var showDebits = true;
      var xTicks = []; // x labels
      var i = 0;
      var list;
      var strDataset = '[';
      var count = 0;
      var chartTitle = '';
      /* get selected accounts */
      var accountsChecked = [];
      $.each($('#show_ov_accounts .tagSelect'), function(i,v) {
        accountsChecked.push($(v).html());
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

      // if any category selected: draw line category chart
      if (accountsChecked.length>0 &&
          (chartSelection == 'line_credit' || chartSelection == 'line_debit')) {
        showDebits = (chartSelection == 'line_debit');
        list = data.accounts;
        chartTitle = chartSelection?mlog.translator.get('expenses by category'):mlog.translator.get('credits by category');
        for (var category in list) {
          /* if not checked skip */
          if ($.inArray(category,accountsChecked)<0) continue;
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
        // chart line (total)
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
      var size = $('#accounts_chart').width()-25;
      $('#accounts_chart').html('<h1>'+ chartTitle +
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
