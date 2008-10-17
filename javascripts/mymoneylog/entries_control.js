/**
 * entries_control.js - entries controller
 * @author Ricardo Nishimura - 2008
 */
mlog.entriesControl = function() {
  var htmlTemplate = null;
  var storedSearches = [];
  var filterOptions = {};
  var hideSummary = false;
  var resetFilterOptions = function() {
    filterOptions = {
      query: '',
      pageNumber:1,
      entriesPerPage: 50,
      startDate: '2000-01-01',
      endDate: mlog.base.getCurrentDate(),
      values: 0,
      categories: [],
      accounts: [],
      sortColIndex: 0,
      sortReverse: true
      };
    $('#filter_date_from').val(filterOptions.startDate);
    $('#filter_date_until').val(filterOptions.endDate);
    $('#filter_query').val(filterOptions.query);
    $('#filter_values').val(filterOptions.values);
    mlog.entriesControl.updateTagCloud();
  };
  return {
    /* initialize template, completers, datepicker... */
    init: function() {
      if (!htmlTemplate) {
        /* trying to not generate any new markup, just get from html */
        var summaryTemplate;
        /* break table rows */
        var rows = $('#summary_table').html().replace(/<\/tr>/gi, '</tr>!*!');
        rows = rows.split('!*!');
        /* remove nodes inside entries table */
        $('#summary_table tbody').remove();
        /* summary table: append a template hook */
        $('#summary_table').append(document.createTextNode("{summaryContent}"));
        var summaryTemplate = {
          tHead: rows[0],
          tRow: rows[1],
          tRowTotal: rows[2]
        };
        /* break table rows */
        rows = $('#entries_table').html().replace(/<\/tr>/gi, '</tr>!*!');
        rows = rows.split('!*!');
        /* remove nodes inside entries table */
        $('#entries_table tbody').remove();
        /* entries table: append a template hook */
        $('#entries_table').append(document.createTextNode("{entriesContent}"));
        var entriesTemplate = {
          tHead: rows[0],
          tRow: rows[1],
          tRowOdd: rows[1].replace(/row-a/,'row-b'),
          tRowFuture: rows[1].replace(/row-a/,'row-a row_future'),
          tRowFutureOdd: rows[1].replace(/row-a/,'row-b row_future'),
          tRowTotal: rows[2]
        };
        htmlTemplate = {
          summary: summaryTemplate,
          entries: entriesTemplate,
          main: $('#main_entries').html()
        };
        $('#main_entries').html('');

        mlog.entries.getAll(); /* initialize data */
        /* autocomplete options */
        var acOptions = { minChars: 0, max: 50, selectFirst: false, multiple: true, multipleSeparator: '  ' };
        /* category autocomplete */
        $('#input_category').autocomplete(mlog.categories.getNames(),
            { minChars: 0, max: 50, selectFirst: false, multiple: true, multipleSeparator: mlog.base.categorySeparator });
        /* from account autocomplete */
        $('#input_account').autocomplete(mlog.accounts.getNames(),acOptions);
        $('#input_account').result( function() {
            /* on accept jump to: */
            if ($('#input_category').val()!='') {
              if (!$.browser.opera) $('#form_entry button')[0].focus();
            } else {
              $('#input_account_to').focus().select();
            }
          });
        /* to account autocomplete */
        $('#input_account_to').autocomplete(mlog.accounts.getNames(),acOptions);
        $('#input_account_to').result( function() {
            /* on accept jump to: */
            if (!$.browser.opera) $('#form_entry button')[0].focus();
          });
        /* initialize datepicker */
        Calendar.setup({
          inputField: "input_date",
          ifFormat: "%Y-%m-%d",
          weekNumbers: false
        });
        Calendar.setup({
          inputField: "filter_date_from",
          ifFormat: "%Y-%m-%d",
          weekNumbers: false
        });
        Calendar.setup({
          inputField: "filter_date_until",
          ifFormat: "%Y-%m-%d",
          weekNumbers: false
        });
        /* attach on blur event for account transfers */
        $('#input_account').focus(this.toggleToAccount);
        /* fill filter autocomplete */
        storedSearches = mlog.base.getCookie('storedSearches').split('~');
        $('#filter_query').autocomplete(storedSearches,
          { minChars: 0, max: 50, selectFirst: false })
        /* initial date value */
        $('#input_date').val(mlog.base.getCurrentDate());
        resetFilterOptions();
      }
    },
    /* display an entry to input */
    updateInputEntry: function(lineData){
      if (!lineData) {
        return;
      }
      $('#input_date').val(lineData[0]);
      $('#input_value').val(mlog.base.floatToString(lineData[1]));
      $('#input_description').val(lineData[2]);
      $('#input_category').val(lineData[3] || '');
      $('#input_account').val(lineData[4] || '');
    },
    /* remove an entry */
    removeEntry: function(elem){
      var lineId = elem.parentNode.parentNode.getAttribute('id').substring(2);
      if (confirm(mlog.translator.get('delete').toUpperCase()+': '+mlog.translator.get('are you sure?'))) {
        var lineData = mlog.entries.remove(lineId);
        this.show();
        mlog.entriesControl.updateTagCloud();
        this.updateInputEntry(lineData);
      }
    },
    /* display on input when clicked */
    onClickEntry: function(elem){
      var id = elem.parentNode.getAttribute('id').substring(2);
      this.updateInputEntry(mlog.entries.get(id));
      $('#input_date').focus();
      $('#transfer').hide();
    },
    /* build summary */
    getSummary: function() {
      var res = [];
      var tpSum = htmlTemplate.summary;
      /* build summary */
      res.push(tpSum.tHead);
      var accounts = mlog.accounts.getAllwithTotal();
      mlog.base.arraySort(accounts,0);
      var maxValue = 0;
      // find maxValue
      for (var i=0;i<accounts.length-1;i++) {
        if (accounts[i][0]!='' && accounts[i][1]!=0) {
          maxValue = Math.abs(accounts[i][1])>maxValue?Math.abs(accounts[i][1]):maxValue;
        }
      }
      maxValue = maxValue>=100?maxValue:100; /* at least more then 100 */
      for (var i=0;i<accounts.length;i++) {
        strRow = (i<accounts.length-1)?tpSum.tRow:tpSum.tRowTotal;
        if (accounts[i][0] != '') {
          strRow = strRow.replace(/{account_id}/,accounts[i][0]);
        } else {
          if (accounts[i][1] == 0) {
            continue; /* if account and value are empty, move next */
          }
          strRow = strRow.replace(/{account_id}/,'-');
        }
        /* bar style */
        strRow = strRow.replace(/class=""/,(accounts[i][1]<0?'class="neg"':''));
        /* bar width */
        strRow = strRow.replace(/99/,Math.abs(Math.round(accounts[i][1])/maxValue*100));
        /* account total */
        strRow = strRow.replace(/{account_total}/,mlog.base.formatFloat(accounts[i][1]));
        res.push(strRow);
      }
      return res.join('');
    },
    /* display the entries */
    show: function(page){
      mlog.entriesControl.init();
      mlog.base.activateMenu('entries');
      filterOptions.pageNumber = (typeof page == 'number')? page : 1;
      var theTotal = 0;
      var res = '';
      var theData = mlog.entries.getByFilter(filterOptions);
      var currentDate = mlog.base.getCurrentDate();
      var strRow = '';
      var tp = htmlTemplate.entries;
      var content = htmlTemplate.main;
      var odd = true;
      if (theData.length > 0) {
        /* build summary */
        content = content.replace(/{summaryContent}/, mlog.entriesControl.getSummary());
        if (hideSummary) {
          /* apply hide style */
          content = content.replace(/show_next/, 'hide_next');
          content = content.replace(/id="entries_summary"/i, 'id="entries_summary" style="display: none"');
        }
        /* build entries */
        res+=tp.tHead;
        for (i=0; i < theData.length-1; i++) {
          /* apply template tRow or tRowFuture */
          if (theData[i][0] <= currentDate) {
            /* apply odd or even template */
            strRow = odd?tp.tRowOdd:tp.tRow;
          }
          else {
            strRow = odd?tp.tRowFutureOdd:tp.tRowFuture;
          }
          odd = !odd;
          /* the total */
          theTotal += theData[i][1];
          /* apply values to detail row */
          strRow = strRow.replace(/rowId/, 'n_'+theData[i][5]);
          strRow = strRow.replace(/{date}/, theData[i][0]);
          strRow = strRow.replace(/{value}/, mlog.base.formatFloat(theData[i][1]));
          strRow = strRow.replace(/{description}/, theData[i][2]);
          strRow = strRow.replace(/{category}/, theData[i][3]);
          strRow = strRow.replace(/{account}/, theData[i][4]);
          /* is reconcilable? */
          if (theData[i][6]) {
            strRow = strRow.replace(/opt_reconcile hide/,'opt_reconcile');
          }
          res+=strRow;
        }
        /* end of data, put total */
        strRow = tp.tRowTotal.replace(/{totalvalue}/, mlog.base.formatFloat(theTotal));
        strRow = strRow.replace(/{entriescount}/, theData.length-1);
        res+=strRow;
        /* assemble table */
        content = content.replace(/{entriesContent}/, res);
        var maxPage = theData.pop().maxPage || 1;
        content += mlog.base.buildPaginator(filterOptions.pageNumber,maxPage,filterOptions.entriesPerPage)+'<br/>';
      }
      else {
        content = '<h1>' + mlog.translator.get('no data') + '</h1>';
      }
      $('#report').html(content);
      $('#toggle_summary').click( function() {
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
        hideSummary = !hideSummary;
      });
    },

    /* sort table column */
    sortCol: function(index){
      filterOptions.sortReverse = (filterOptions.sortColIndex != index) ? false : !filterOptions.sortReverse;
      filterOptions.sortColIndex = index;
      this.show();
    },

    /* add an entry from input */
    addEntry: function(elem){
      var entry = [ $('#input_date').val(),
                    $('#input_value').val(),
                    $('#input_description').val(),
                    $('#input_category').val(),
                    $('#input_account').val(),
                    $('#input_account_to').val()];
      var addCount = mlog.entries.getCount();
      mlog.entries.add(entry);
      /* refresh entries */
      this.show();
      mlog.entriesControl.updateTagCloud();
      /* blink add button */
      $(elem).fadeOut('fast').fadeIn('fast');
      /* apply style to new entry */
      var newCount = mlog.entries.getCount();
      addCount = newCount - addCount;
      for (var i=1; i<=addCount; i++) {
        /* stylise new entries */
        $('#n_'+(newCount-i)).addClass('new_entry');
      }
      /* initial state and update autocompleters */
      $('#transfer').hide();
      $('#input_date').focus();
      $('#input_category').setOptions({data: mlog.categories.getNames()});
      $('#input_account').setOptions({data: mlog.accounts.getNames()});
      $('#input_account_to').val('').setOptions({data: mlog.accounts.getNames()});
    },
    /* toggle 'to account' */
    toggleToAccount: function() {
      if ($('#input_category').val() == '') {
        $('#transfer').show();
      } else {
        $('#transfer').hide();
      }
    },
    onPageChange: function() {
      filterOptions.entriesPerPage = parseInt($('#entriesPerPage').val() || 50);
      mlog.entriesControl.show(parseInt($('#select_page').val()));
    },
    reconcileEntry: function(elem){
      var id = elem.parentNode.parentNode.getAttribute('id').substring(2);
      if (confirm(mlog.translator.get('reconcile').toUpperCase()+': '+mlog.translator.get('are you sure?'))) {
        mlog.entries.reconcile(id);
        this.show();
        $('#n_'+(mlog.entries.getCount()-1)).addClass('new_entry');
      }
    },
    /* read options panel and set to variables*/
    updateOptions: function() {
      var selectedCategories = [];
      $.each( $('#entries_category_cloud .tagSelect'), function(i,v) { selectedCategories.push($(v).html()); });
      var selectedAccounts = [];
      $.each( $('#entries_account_cloud .tagSelect'), function(i,v) { selectedAccounts.push($(v).html()); });
      filterOptions.query = $.trim($('#filter_query').val());
      filterOptions.entriesPerPage = parseInt($('#entriesPerPage').val() || 50);
      filterOptions.startDate = $('#filter_date_from').val();
      filterOptions.endDate = $('#filter_date_until').val();
      filterOptions.values = parseInt($('#filter_values').val()) || 0;
      filterOptions.categories = selectedCategories;
      filterOptions.accounts = selectedAccounts;
      /* update stored searches */
      if (filterOptions.query!='' && $.inArray(filterOptions.query, storedSearches)<0) {
        storedSearches.unshift(filterOptions.query);
        var str = storedSearches.join('~');
        while (str.length>1024) {
          storedSearches.pop();
          str = storedSearches.join('~');
        }
        mlog.base.setCookie('storedSearches',str,120);
        /* refresh filter autocomplete */
        $('#filter_query').setOptions({data: storedSearches});
      }
    },
    applyOptions: function() {
      this.updateOptions();
      this.show();
    },
    updateTagCloud: function() {
      $('#entries_category_cloud').html(mlog.base.arrayToTagCloud(mlog.categories.getAll(),1));
      $('#entries_account_cloud').html(mlog.base.arrayToTagCloud(mlog.accounts.getAll(),2));
      // mark selected categories
      if (filterOptions.categories.length>0) {
        var regex = eval('/('+filterOptions.categories.join('|')+')/i');
        if (regex!==undefined) {
          $.each( $('#entries_category_cloud').children(), function(i,v) {
            if (regex.test($(v).html())) $(v).addClass('tagSelect');
            });
        }
      }
      // mark selected accounts
      if (filterOptions.accounts.length>0) {
        var regex = eval('/('+filterOptions.accounts.join('|')+')/i');
        if (regex!==undefined) {
          $.each( $('#entries_account_cloud').children(), function(i,v) {
            if (regex.test($(v).html())) $(v).addClass('tagSelect');
            });
        }
      }
    },
    resetFilter: function() {
      resetFilterOptions();
      this.show();
    }
  };
}();
