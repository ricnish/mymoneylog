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
        var rows = $('#categories_overview_table').html().replace(/<\/tr>/gi, '</tr>!*!');
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
      var theData = mlog.entries.getCategoriesOverview( parseInt($('#overviewNumberMonths option:selected').attr('value'))-1,
        $('#input_ov_until_date').val());
      var res = [];
      var str = '';
      var odd = true;
      var month = null;
      if (theData) {
        var list = theData.categories;
        /* build header */
        res.push(htmlTemplate.overview.tHeadLabel);
        for (month in list[mlog.categories.getNames()[0]]) {
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
          for (month in list[categoriesList[i]]) {
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
          for (month in list[total]) {
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
        str = str.replace(/{overviewContent}/,res.join(''));
      }
      else {
        str = '<h1>' + mlog.translator.get('no data') + '</h1>';
      }
      $('#report').html(str);
      res = null;
      /* display the chart */
      mlog.categoriesControl.drawChart(theData);
      /* hide/show function */
      $('#categories_chart_title').click( function() {
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
        hideOverview = !hideOverview;
      });
    },
    updateTagCloud: function() {
      $('#show_ov_categories').html(mlog.base.arrayToTagCloud(mlog.categories.getAll(),1));
      $('#show_ov_categories .tagCloud').click(function(v) {
        mlog.base.toggleTag(v);
        mlog.categoriesControl.updateView();
      });
    },
    toggleAllTagCloud: function(el) {
      mlog.base.toggleAllTagCloud(el);
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
      var chartSelection = $('#chartSelection option:selected').attr('value');
      var showDebits = true;
      var xTicks = []; // x labels
      var list;
      var count = 0;
      var chartTitle = '';
      var dataset = [];
      var values = [];
      var tmpValue=0;
      var month = null;
      /* get selected categories */
      var categoriesChecked = [];
      $.each($('#show_ov_categories .tagSelect'), function(i,v) {
        categoriesChecked.push($(v).html());
      });
      /* build x labels */
      /* as: [[0, '2008-01'],[1, '2008-02']]... */
      for (month in data.summary[mlog.translator.get('balance')]) {
        xTicks.push([count, month]);
        count++;
      }
      // if any category selected: draw line category chart
      if (categoriesChecked.length>0 &&
        (chartSelection == 'line_credit' || chartSelection == 'line_debit')) {
        showDebits = (chartSelection === 'line_debit');
        list = data.categories;
        chartTitle = showDebits?mlog.translator.get('expenses by category'):mlog.translator.get('credits by category');
        for (var category in list) {
          /* if not checked skip */
          if ($.inArray(category,categoriesChecked)<0) continue;
          count = 0;
          values = [];
          /* build category month's values */
          /* eg: [[0,100],[1,95]], ... */
          for (month in list[category]) {
            tmpValue = Math.round(list[category][month]) * (showDebits?-1:1);
            tmpValue = (tmpValue>0)?tmpValue:0;
            values.push([count, tmpValue]);
            count++;
          }
          dataset.push({
            label: category,
            data: values
          });
        }
      } else {
        // chart line (total)
        // draw summary chart
        list = data.summary;
        chartTitle = mlog.translator.get('overview');
        for (var description in list) {
          count = 0;
          values = [];
          // if debit show value as positive
          if (description == mlog.translator.get('debit')) {
            showDebits=true;
          } else {
            showDebits=false;
          }
          for (month in list[description]) {
            tmpValue = Math.round(list[description][month]) * (showDebits?-1:1)
            values.push([count, tmpValue]);
            count++;
          }
          dataset.push({
            label: description,
            data: values
          });
        }
      }
      // chart container
      chartTitle = mlog.translator.get('chart')+': '+chartTitle;
      var size = $('#categories_chart').width()-35;
      $('#categories_chart').html('<h1 id="categories_chart_title" class="show_next">'+ chartTitle + '</h1>' +
        '<div><b class="rc1g"></b><b class="rc2g"></b><div class="glass">' +
        '<div id="chart_canvas" style="height:'+(size/1.75)+'px; width:'+(size)+'px;"></div>' +
        '</div><b class="rc2g"></b><b class="rc1g"></b></div>');
      // draw
      mlog.base.drawChart('#chart_canvas',dataset,xTicks);
    }
  }
}();
