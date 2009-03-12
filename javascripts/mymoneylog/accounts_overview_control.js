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
        var rows = $('#accounts_overview_table').html().replace(/<\/tr>/gi, '</tr>!*!');
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
        $('#input_accounts_until_date').jscalendar().val(mlog.base.getCurrentDate());
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
      theData = mlog.entries.getAccountsOverview( parseInt($('#accountsNumberMonths option:selected').attr('value'))-1,
        $('#input_accounts_until_date').val(),
        accountsList);
      var res = [];
      var str = '<h1>' + mlog.translator.get('no data') + '</h1>';
      var odd = true;
      if (theData!==null) {
        /* build header */
        res.push(htmlTemplate.overview.tHeadLabel);
        for (var i=0;i<theData[0][1].length;i++) {
          str = htmlTemplate.overview.tHeadColumn.replace(/{account}/,theData[0][1][i][0]);
          res.push(str);
        }
        res.push('</tr>'); // closing tag
        /* build accounts rows */
        for (i=0;i<theData.length;i++) {
          str = odd?htmlTemplate.overview.tRowOddLabel:htmlTemplate.overview.tRowLabel;
          odd = !odd;
          str = str.replace(/{date}/,theData[i][0]);
          res.push(str);
          /* build values */
          str = htmlTemplate.overview.tRowColumn;
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
      var chartTitle = mlog.translator.get('chart')+': '+mlog.translator.get('diary balance');
      var xTicks = [];
      var dataset = [];
      var values = [];
      /* build x labels */
      /* as: [[0, '10-01'],[1, '10-02']]... month-day */
      var nTicks = Math.round(data.length/12)||7;
      for (var i=0;i<data.length;i+=nTicks) {
        xTicks.push([i,data[i][0].slice(5,10)]);
      }
      for (var i=0;i<data[0][1].length;i++) {
        values = [];
        /* build account's day values */
        /* eg: [[0,100],[1,95]], ... */
        for (var n=0;n<data.length;n++) {
          values.push([n, data[n][1][i][1]]);
        }
        dataset.push({label: data[0][1][i][0], data: values});
      }
      // chart container
      var size = $('#accounts_chart').width()-35;
      $('#accounts_chart').html('<h1 id="accounts_chart_title" class="msg show_next">'+ chartTitle + '</h1>' +
        '<div><b class="rc1g"></b><b class="rc2g"></b><div class="glass">' +
        '<div id="chart_canvas" style="height:'+(size/1.75)+'px; width:'+(size)+'px;"></div>' +
        '</div><b class="rc2g"></b><b class="rc1g"></b></div>');
      // draw
      mlog.base.drawChart('#chart_canvas',dataset,xTicks);
    }
  }
}();
