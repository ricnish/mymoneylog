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
    show: function() {
      mlog.overviewControl.init();
      mlog.base.activateMenu('overview');
      mlog.overviewControl.updateCategoriesCheckBoxes();
      /* get selected categories */
      var categoriesList = [];
      $.each($('#show_ov_categories input:checked'), function() {
        categoriesList.push($(this).attr('title'));
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
          str = htmlTemplate.overview.tHeadColumn;
          str = str.replace(/{month}/,month);
          res.push(str);
        }
        res.push('</tr>'); // closing tag
        /* build categories rows */
        for (var i=0;i<categoriesList.length;i++) {
          str = odd?htmlTemplate.overview.tRowOddLabel:htmlTemplate.overview.tRowLabel;
          odd = !odd;
          str = str.replace(/{title}/,categoriesList[i]);
          res.push(str);
          /* build values */
          str = htmlTemplate.overview.tRowColumn;
          for (var month in list[categoriesList[i]]) {
            res.push(str.replace(/{value}/,mlog.base.formatFloat(list[categoriesList[i]][month])));
          }
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
          for (var month in list[total]) {
            res.push(str.replace(/{value}/,mlog.base.formatFloat(list[total][month])));
          }
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
    updateCategoriesCheckBoxes: function() {
      /* show categories check boxes */
      var cList = mlog.categories.getNames();
      var listed = listedCategories;
      var show = false;
      /* check if is needed to update */
      $.each(cList, function(i,v) {
        if ($.inArray(v,listed)<0) {
          show = true;
          return false;
        }
      });
      if (show) {
        var list = '';
        for (var i=0;i<cList.length;i++) {
          list += '<input id="chkbox_ov_'+cList[i]+'" name="chkbox_ov_'+cList[i]+
            '" class="input_checkbox" type="checkbox" title="'+cList[i]+
            '" checked="checked"/>'+cList[i]+'<br/>';
        }
        $('#show_ov_categories').html(list);
        listedCategories = cList;
      }
    },
    toggleCategoriesCheckBoxes: function() {
      var chk = $('#chkbox_ov_all:checked').length>0;
      $.each($('#show_ov_categories input'), function() {
        $(this).attr('checked',chk?'checked':'');
      });
    }
  }
}();
