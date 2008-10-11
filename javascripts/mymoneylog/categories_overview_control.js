/**
 * overview_control.js - overview controller
 * @author Ricardo Nishimura - 2008
 */
mlog.categoriesControl = function() {
  var htmlTemplate = null;
  var hideOverview = false;
  return {
    init: function() {
      /* initialize template... */
      if (!htmlTemplate) {
        var overviewTemplate = {};
        /* trying to not generate any new markup, just get from html */
        /* break table rows */
        rows = $('#categories_overview_table').html().replace(/<\/tr>/gi, '</tr>!*!');
        rows = rows.replace(/  /gi,'');
        rows = rows.split('!*!');
        for (var i=0;i<rows.length;i++) {
          rows[i] = rows[i].replace(/<\/td>/i,'</td>!*!');
          rows[i] = rows[i].replace(/<\/th>/i,'</th>!*!');
          rows[i] = rows[i].split('!*!');
        }
        /* remove nodes inside entries table */
        $("#categories_overview_table tbody").remove();
        /* entries table: append a template hook */
        $('#categories_overview_table').append(document.createTextNode("{overviewContent}"));
        overviewTemplate = {
          tHeadLabel: rows[0][0],
          tHeadColumn: (rows[0][1]).replace(/<\/tr>/i,''),
          tRowLabel: rows[1][0],
          tRowOddLabel: (rows[1][0]).replace(/row-a/,'row-b'),
          tRowTotalLabel: rows[1][0].replace(/row-a/,'total'),
          tRowColumn: (rows[1][1]).replace(/<\/tr>/i,'')
        };
        htmlTemplate = {
          overview: overviewTemplate,
          main: $('#main_categories_overview').html()
        };
        $('#main_categories_overview').html('');
        /* initialize datepicker */
        Calendar.setup({
          inputField: "input_ov_until_date",
          ifFormat: "%Y-%m-%d",
          weekNumbers: false
        });
        /* initial date value */
        $('#input_ov_until_date').val(mlog.base.getCurrentDate());
      }
    },
    /* show overview */
    updateView: function() {
      /* get selected categories */
      var categoriesList = [];
      $.each($('#show_ov_categories .tagSelect'), function(i,v) {
        categoriesList.push($(v).html());
      });
      var theData = mlog.entries.getOverview( parseInt($('#overviewNumberMonths').val())-1,
        $('#input_ov_until_date').val());
      var res = [];
      var str = '';
      var odd = true;
      if (theData) {
        var list = theData.categories;
        /* build header */
        res.push(htmlTemplate.overview.tHeadLabel);
        for (var month in list[mlog.categories.getNames()[0]]) {
          str = htmlTemplate.overview.tHeadColumn.replace(/{month}/,month);
          res.push(str);
        }
        str = htmlTemplate.overview.tHeadColumn.replace(/{month}/,mlog.translator.get('average'));
        res.push(str + '</tr>'); // closing tag
        /* build categories rows */
        var avgSum = 0;
        var avgCount = 0;
        for (var i=0;i<categoriesList.length;i++) {
          str = odd?htmlTemplate.overview.tRowOddLabel:htmlTemplate.overview.tRowLabel;
          odd = !odd;
          str = str.replace(/{title}/,categoriesList[i]);
          res.push(str);
          /* build values */
          str = htmlTemplate.overview.tRowColumn;
          avgSum = 0;
          avgCount = 0;
          for (var month in list[categoriesList[i]]) {
            res.push(str.replace(/{value}/,mlog.base.formatFloat(list[categoriesList[i]][month])));
            avgSum += list[categoriesList[i]][month];
            avgCount++;
          }
          res.push(str.replace(/{value}/,mlog.base.formatFloat(avgSum/avgCount)));
          res.push('</tr>'); // closing tag
        }
        /* build summary */
        list = theData.summary;
        for (var total in list) {
          str = htmlTemplate.overview.tRowTotalLabel;
          str = str.replace(/{title}/,total);
          res.push(str);
          /* build values */
          str = htmlTemplate.overview.tRowColumn;
          avgSum = 0;
          for (var month in list[total]) {
            res.push(str.replace(/{value}/,mlog.base.formatFloat(list[total][month])));
            avgSum += list[total][month];
          }
          if (total != mlog.translator.get('accumulated'))
            res.push(str.replace(/{value}/,mlog.base.formatFloat(avgSum/avgCount)));
          else
            res.push(str.replace(/{value}/,'&nbsp;'));
          res.push('</tr>'); // closing tag
        }
        str = htmlTemplate.main;
        if (hideOverview) {
          /* apply hide style */
          str = str.replace(/show_next/, 'hide_next');
          str = str.replace(/id="categories_overview_summary"/i, 'id="categories_overview_summary" style="display: none"');
        }
        str = str.replace(/{overviewContent}/,res.join(''));
      }
      else {
          str = '<h1>' + mlog.translator.get('no data') + '</h1>';
      }
      $('#report').html(str);
      res = null;
      /* hide/show overview table */
      $('#toggle_categories_overview_table').click( function() {
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
        hideOverview = !hideOverview;
      });
      /* display the chart */
      mlog.categoriesControl.drawChart(theData);
    },
    updateTagCloud: function() {
      $('#show_ov_categories').html(mlog.base.arrayToTagCloud(mlog.categories.getAll(),1));
      $('#show_ov_categories .tagCloud').click(function(v) {
        mlog.base.toggleTag(v);
        mlog.categoriesControl.updateView();
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
      mlog.categoriesControl.updateView();
    },
    show: function() {
      mlog.categoriesControl.init();
      mlog.base.activateMenu('categories_overview');
      $('#panel_categories_overview .selectAll').removeClass("tagSelect");
      mlog.categoriesControl.updateTagCloud();
      mlog.categoriesControl.toggleAllTagCloud($('#panel_categories_overview .selectAll'));
    },
    drawChart: function(data) {
      if (!data) {
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
      /* get selected categories */
      var categoriesChecked = [];
      $.each($('#show_ov_categories .tagSelect'), function(i,v) {
        categoriesChecked.push($(v).html());
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
      if (categoriesChecked.length>0 &&
          (chartSelection == 'line_credit' || chartSelection == 'line_debit')) {
        showDebits = (chartSelection == 'line_debit');
        list = data.categories;
        chartTitle = chartSelection?mlog.translator.get('expenses by category'):mlog.translator.get('credits by category');
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
      var size = $('#categories_chart').width()-25;
      $('#categories_chart').html('<h1>'+ chartTitle +
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
