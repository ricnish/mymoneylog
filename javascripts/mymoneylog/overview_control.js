/**
 * overview_control.js - overview controller
 * @author Ricardo Nishimura - 2008
 */
mlog.overviewControl = function() {
  var htmlTemplate = null;
  var listedCategories = [];
  return {
    init: function() {
      /* initialize template... */
      if (!htmlTemplate) {
        var overviewTemplate = {};
        /* trying to not generate any new markup, just get from html */
        /* break table rows */
        rows = $('#overview_table').html().replace(/<\/tr>/gi, '</tr>!*!');
        rows = rows.replace(/  /gi,'');
        rows = rows.split('!*!');
        for (var i=0;i<rows.length;i++) {
          rows[i] = rows[i].replace(/<\/td>/i,'</td>!*!');
          rows[i] = rows[i].replace(/<\/th>/i,'</th>!*!');
          rows[i] = rows[i].split('!*!');
        }
        /* remove nodes inside entries table */
        $("#overview_table tbody").remove();
        /* entries table: append a template hook */
        $('#overview_table').append(document.createTextNode("{overviewContent}"));
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
          main: $('#main_overview').html()
        };
        $('#main_overview').html('');
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
        str = htmlTemplate.main.replace(/{overviewContent}/,res.join(''));
      }
      else {
          str = '<h1>' + mlog.translator.get('no data') + '</h1>';
      }
      $('#report').html(str);
      res = null;
      /* hide/show overview table */
      $('#toggle_overview_table').click( function() {
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
      });
      /* display the chart */
      mlog.chartControl.show(theData);
    },
    updateTagCloud: function() {
      $('#show_ov_categories').html(mlog.base.arrayToTagCloud(mlog.categories.getAll(),1));
      $('#show_ov_categories .tagCloud').click(function(v) {
        mlog.base.toggleTag(v);
        mlog.overviewControl.updateView();
      });
    },
    toggleAllTagCloud: function() {
      var elem = $('.selectAll');
      mlog.base.toggleTag(elem);
      var chk = $(elem).hasClass("tagSelect");
      $.each($('#show_ov_categories .tagCloud'), function(i,v) {
        $(v).removeClass("tagSelect");
        if (chk) $(v).addClass("tagSelect");
      });
      mlog.overviewControl.updateView();
    },
    show: function() {
      mlog.overviewControl.init();
      mlog.base.activateMenu('overview');
      $('.selectAll').removeClass("tagSelect");
      mlog.overviewControl.updateTagCloud();
      mlog.overviewControl.toggleAllTagCloud();
      mlog.overviewControl.updateView();
    }
  }
}();
