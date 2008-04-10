/**
 * overview_control.js - overview controller
 * @author Ricardo Nishimura - 2008
 */
mlog.overviewControl = function() {
  var htmlTemplate = null;
  return {
    data: [],
    sortColIndex: 0,
    sortColRev: false,
    /* initialize template ... */
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
          daFormat: "%Y-%m-%d",
          showsTime: false,
          button: "input_ov_until_date",
          singleClick: true,
          step: 2,
          weekNumbers: false
        });
        /* initial date value */
        $('#input_ov_until_date').val(mlog.base.getCurrentDate());
      }
    },
    /* summarize last n months */
    getLastMonths: function(n) {
      var nMonths = n || 6;
      var dtEnd = $('#input_ov_until_date').val() || mlog.base.getCurrentDate();
      var dtStart = mlog.base.addMonths(mlog.base.stringToDate(dtEnd),n*-1);
      dtStart.setDate(1);
      dtStart = mlog.base.dateToString(dtStart);
      var entries = mlog.entries.getByDate(dtStart,dtEnd);
      var total = {
        categories:{},
        summary:{}
        };
      var categoriesIds = mlog.categories.getNames();
      var debitId = mlog.translator.get('debit');
      var creditId = mlog.translator.get('credit');
      var balanceId = mlog.translator.get('balance');
      var totalId = mlog.translator.get('accumulated');
      /* initialize months */
      var months = [];
      for (var i=nMonths;i>=0;i--) {
        var month = mlog.base.addMonths(mlog.base.stringToDate(dtEnd),i*-1);
        month = mlog.base.dateToString(month);
        month = month.slice(0,7);
        months.push(month);
      }
      // initialize total
      for (var i=0;i<categoriesIds.length;i++) {
        total['categories'][categoriesIds[i]] = {};
      }
      total['summary'][debitId] = {};
      total['summary'][creditId] = {};
      total['summary'][balanceId] = {};
      total['summary'][totalId] = {};
      for (var m=0; m<months.length; m++) {
        total['summary'][debitId][months[m]] = 0;
        total['summary'][creditId][months[m]] = 0;
        total['summary'][balanceId][months[m]] = 0;
        total['summary'][totalId][months[m]] = 0;
        for (var i=0;i<categoriesIds.length;i++) {
          total['categories'][categoriesIds[i]][months[m]] = 0;
        }
      }
      // process entries
      var category;
      var month;
      var value;
      var accumulated = 0;
      mlog.base.arraySort(entries,0);
      for (var i=0;i<entries.length;i++) {
        month = (entries[i][0]).slice(0, 7);
        value = entries[i][1];
        category = entries[i][3];
        if (category != '') {
          total['categories'][category][month] += value;
          /* sum credit (if has category) */
          if (value>0) {
            total['summary'][creditId][month] += value;
          }
          /* sum debit (if has category) */
          if (value<0) {
            total['summary'][debitId][month] += value;
          }
        }
        /* calc balance */
        total['summary'][balanceId][month] += value;
        /* sum total */
        accumulated += value;
        total['summary'][totalId][month] = accumulated;
      }
      return total;
    },
    show: function() {
      mlog.base.activateMenu('overview');
      var nMonths = parseInt($('#overviewNumberMonths').val())-1;
      var theData = mlog.overviewControl.getLastMonths(nMonths);
      mlog.overviewControl.init();
      var res = [];
      var str = '';
      var isHeader = true;
      var odd = true;
      if (theData) {
        var list = theData.categories;
        for (var category in list) {
          /* build header */
          if (isHeader) {
            res.push(htmlTemplate.overview.tHeadLabel);
            for (var month in list[category]) {
              str = htmlTemplate.overview.tHeadColumn;
              str = str.replace(/{month}/,month);
              res.push(str);
            }
            res.push('</tr>'); // closing tag not included
            isHeader = false; // just one time
          }
          /* get description */
          if (odd) {
            str = htmlTemplate.overview.tRowOddLabel;
          } else {
            str = htmlTemplate.overview.tRowLabel;
          }
          odd = !odd;
          str = str.replace(/{title}/,category);
          res.push(str);
          /* build values */
          for (var month in list[category]) {
            str = htmlTemplate.overview.tRowColumn;
            str = str.replace(/{value}/,mlog.base.formatFloat(list[category][month]));
            res.push(str);
          }
          res.push('</tr>'); // closing tag not included
        }
        /* build summary */
        list = theData.summary;
        for (var total in list) {
          str = htmlTemplate.overview.tRowTotalLabel;
          str = str.replace(/{title}/,total);
          res.push(str);
          /* build values */
          for (var month in list[total]) {
            str = htmlTemplate.overview.tRowColumn;
            str = str.replace(/{value}/,mlog.base.formatFloat(list[total][month]));
            res.push(str);
          }
        }
        str = htmlTemplate.main;
        str = str.replace(/{overviewContent}/,res.join(''));
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
    }
  }
}();
