/**
 * entries_control.js - entries controller
 * @author Ricardo Nishimura - 2008
 */
mlog.entriesControl = function(){
  var _htmlTemplate = null;
  var _storedSearches = mlog.base.getCookie('storedSearches').split('~');
  var _filterOptions = {};
  var _hideSummary = false;
  /* autocomplete options */
  var _acOptions = {
    minChars: 0,
    max: 50,
    selectFirst: false
  };
  var _acOptionsMulti = {
    minChars: 0,
    max: 50,
    selectFirst: false,
    multiple: true,
    multipleSeparator: mlog.base.categorySeparator
  };

  /* default start date: begin prev month */
  var _dtStart = mlog.base.addMonths(new Date, -1);
  _dtStart.setDate(1);
  _dtStart = mlog.base.dateToString(_dtStart);
  /* default end date: next week */
  var _dtEnd = new Date();
  _dtEnd.setDate(_dtEnd.getDate() + 7);
  _dtEnd = mlog.base.dateToString(_dtEnd);

  var resetFilterOptions = function(){
    _filterOptions = {
      query: '',
      pageNumber: 1,
      entriesPerPage: 50,
      startDate: _dtStart,
      endDate: _dtEnd,
      values: 0,
      categories: [],
      accounts: [],
      sortColIndex: 0,
      sortReverse: true
    };
    $('#filter_date_from').val(_filterOptions.startDate);
    $('#filter_date_until').val(_filterOptions.endDate);
    $('#filter_query').val(_filterOptions.query);
    $('#filter_values').val(_filterOptions.values);
    mlog.entriesControl.updateTagCloud();
  };
  /* update stored searches */
  function updateSearches(strQuery) {
      if (_filterOptions.query != '' && $.inArray(_filterOptions.query, _storedSearches) < 0) {
        // add to start of array
        _storedSearches.unshift(_filterOptions.query);
        var str = _storedSearches.join('~');
        // remove items if length > 1024
        while (str.length > 1024) {
          _storedSearches.pop();
          str = _storedSearches.join('~');
        }
        // store searches in a cookie
        mlog.base.setCookie('storedSearches', str, 120);
        /* refresh filter autocomplete */
        $('#filter_query').setOptions({
          data: _storedSearches
        });
      }
  };
  return {
    /* initialize template, completers, datepicker... */
    init: function(){
      if (!_htmlTemplate) {
        /* trying to not generate any new markup, just get from html */
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
          tRowOdd: rows[1].replace(/row-a/, 'row-b'),
          tRowFuture: rows[1].replace(/row-a/, 'row-a row_future'),
          tRowFutureOdd: rows[1].replace(/row-a/, 'row-b row_future'),
          tRowTotal: rows[2]
        };
        _htmlTemplate = {
          summary: summaryTemplate,
          entries: entriesTemplate,
          main: $('#main_entries').html()
        };
        $('#main_entries').html('');
        /* initialize data */
        mlog.entries.getAll();
        /* description autocomplete */
        $('#input_description').autocomplete(mlog.entries.getDescriptions(), _acOptions);
        /* category autocomplete */
        $('#input_category').autocomplete(mlog.categories.getNames(), _acOptionsMulti);
        /* from account autocomplete */
        $('#input_account').autocomplete(mlog.accounts.getNames(), _acOptions
        ).result(function(){
          /* on accept jump to: */
          if ($('#input_category').val() != '') {
            if (!$.browser.opera)
              $('#form_entry button')[0].focus();
          }
          else {
            $('#input_account_to').focus().select();
          }
        }).focus(function() {
        /* attach on focus event for account transfers */
          if ($('#input_category').val() == '') {
            $('#transfer').show();
          }
          else {
            $('#transfer').hide();
          }
        });
        /* to account autocomplete */
        $('#input_account_to').autocomplete(mlog.accounts.getNames(), _acOptions
        ).result(function(){
          /* on accept jump to: */
          if (!$.browser.opera)
            $('#form_entry button')[0].focus();
        });
        /* initialize datepicker */
        $('#input_date').jscalendar().val(mlog.base.getCurrentDate());;
        $('#filter_date_from').jscalendar();
        $('#filter_date_until').jscalendar();
        /* fill filter autocomplete */
        $('#filter_query').autocomplete(_storedSearches, _acOptions);
        /* auto clear form configuration */
        if (mlog.base.getCookie('entryFormAutoClear') == 'true') {
          $('#input_auto_clear').attr('checked', 'true');
        }
        else {
          $('#input_auto_clear').attr('checked', '');
        }
        $('#input_auto_clear').click(function(){
          if ($('#input_auto_clear').attr('checked') == true) {
            mlog.base.setCookie('entryFormAutoClear', 'true');
          }
          else {
            mlog.base.setCookie('entryFormAutoClear', 'false');
          }
        });
        resetFilterOptions();
        this.clearEntry();
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
      if (lineData[6]) {
        $('#input_pending').attr('checked', 'true');
      }
      else {
        $('#input_pending').attr('checked', '');
      }
      $('#transfer').hide();
    },
    /* remove an entry */
    removeEntry: function(elem){
      var lineId = elem.parentNode.parentNode.getAttribute('id').substring(2);
      if (confirm(mlog.translator.get('delete').toUpperCase() + ': ' + mlog.translator.get('are you sure?'))) {
        var lineData = mlog.entries.remove(lineId);
        this.show();
        mlog.entriesControl.updateTagCloud();
        this.updateInputEntry(lineData);
      }
    },
    /* prepare a selected row to be edited */
    prepareRowEdit: function(elem){
      var lineId = '#' + elem.parentNode.parentNode.getAttribute('id');
      /* clear any previous preparation to edit */
      if ($('#input_date_row').length > 0)
        this.onPageChange();
      var row = $(lineId);
      /* retrieve values */
      var isReconcilable = row.hasClass('row_reconcilable');
      var cols = row.children();
      var _date, _value, _description, _category, _account;
      _date = $.trim($(cols[0]).html());
      _date += (isReconcilable) ? '?' : '';
      _value = $.trim($(cols[1]).children().html());
      _description = $.trim($(cols[2]).html());
      _category = $.trim($(cols[3]).html());
      _account = $.trim($(cols[4]).html());
      /* insert input fields
        obs: injecting from html template is messing in safari and chrome */
      $(cols[0]).unbind().html('<input id="input_date_row" class="input_row" type="text" />');
      $(cols[1]).unbind().html('<input id="input_value_row" class="input_row" type="text" />');
      $(cols[2]).unbind().html('<input id="input_description_row" class="input_row" type="text" />');
      $(cols[3]).unbind().html('<input id="input_category_row" class="input_row" type="text" />');
      $(cols[4]).unbind().html('<input id="input_account_row" class="input_row" type="text" />');
      $(cols[5]).html('<span class="opt_cancel" onclick="mlog.entriesControl.onPageChange()">&nbsp;</span>&nbsp;' +
      '<span class="opt_ok" onclick="mlog.entriesControl.applyRowEdit(this)">&nbsp;</span>');

      /* insert values and prepare autocompleters */
      $('#input_date_row').jscalendar().val(_date);
      $('#input_value_row').val(_value);
      $('#input_description_row').autocomplete(mlog.entries.getDescriptions(), _acOptions).val(_description);
      $('#input_category_row').autocomplete(mlog.categories.getNames(), _acOptionsMulti).val(_category);
      $('#input_account_row').autocomplete(mlog.accounts.getNames(), _acOptions).val(_account);
    },
    /* apply changes after a start row editing */
    applyRowEdit: function(elem){
      var lineId = elem.parentNode.parentNode.getAttribute('id').substring(2);
      mlog.entries.remove(lineId);
      var addCount = mlog.entries.getCount();
      mlog.entries.add([$('#input_date_row').val(),
                        $('#input_value_row').val(),
                        $('#input_description_row').val(),
                        $('#input_category_row').val(),
                        $('#input_account_row').val(),
                        '' ]);
      /* refresh entries */
      this.show();
      /* stylise new entry */
      $('#n_' + (addCount)).addClass('new_entry');
    },
    /* display on input when clicked */
    onClickEntry: function(elem){
      var id = elem.parentNode.getAttribute('id').substring(2);
      this.updateInputEntry(mlog.entries.get(id));
    },
    /* build summary */
    getSummary: function(){
      var tpSum = _htmlTemplate.summary;
      /* build summary */
      var res = [tpSum.tHead];
      var accounts = mlog.accounts.getAllwithTotal();
      var maxValue = 0, strRow;
      var accounts_len = accounts.length;
      // find maxValue
      for (var i = 0; i < accounts_len - 1; i++) {
        if (accounts[i][0] != '' && accounts[i][1] != 0) {
          maxValue = Math.abs(accounts[i][1]) > maxValue ? Math.abs(accounts[i][1]) : maxValue;
        }
      }
      maxValue = maxValue >= 100 ? maxValue : 100; /* at least more then 100 */
      for (i = 0; i < accounts_len; i++) {
        if (i < accounts_len - 1) {
          /* bar style and width */
          strRow = tpSum.tRow;
          strRow = strRow.replace(/class="pos"|class=pos/i, (accounts[i][1] < 0 ? 'class="neg"' : 'class="pos"'));
          strRow = strRow.replace(/99/, Math.abs(Math.round(accounts[i][1]) / maxValue * 100));
        } else {
          // process total row
          strRow = tpSum.tRowTotal;
        }
        if (accounts[i][0] != '') {
          strRow = strRow.replace(/{account_id}/, accounts[i][0]);
        }
        else {
          if (accounts[i][1] == 0) {
            continue; /* if account and value are empty, move next */
          }
          strRow = strRow.replace(/{account_id}/, '-');
        }
        /* value */
        strRow = strRow.replace(/{account_total}/, mlog.base.formatFloat(accounts[i][1]));
        res.push(strRow);
      }
      return res.join('');
    },
    /* display the entries */
    show: function(page){
      mlog.entriesControl.init();
      mlog.base.activateMenu('entries');
      _filterOptions.pageNumber = (typeof page == 'number') ? page : 1;

      /* just make sure to remove row autocomplete */
      $('#input_category_row').unautocomplete();
      $('#input_account_row').unautocomplete();

      var theTotal = 0;
      var res = [];
      var theData = mlog.entries.getByFilter(_filterOptions);
      var currentDate = mlog.base.getCurrentDate();
      var strRow = '';
      var tp = _htmlTemplate.entries;
      var content = _htmlTemplate.main;
      var odd = true;
      if (theData.length > 0) {
        /* build summary */
        content = content.replace(/{summaryContent}/, mlog.entriesControl.getSummary());
        if (_hideSummary) {
          /* apply hide style */
          content = content.replace(/show_next/, 'hide_next');
          content = content.replace(/id="entries_summary"/i, 'id="entries_summary" style="display: none"');
        }
        /* build entries */
        res.push(tp.tHead);
        for (var i = 0, data_len=theData.length - 1 ; i < data_len; i++) {
          /* apply template tRow or tRowFuture */
          if (theData[i][0] <= currentDate) {
            /* apply odd or even template */
            strRow = odd ? tp.tRowOdd : tp.tRow;
          }
          else {
            strRow = odd ? tp.tRowFutureOdd : tp.tRowFuture;
          }
          odd = !odd;
          /* is reconcilable? */
          if (theData[i][6]) {
            strRow = strRow.replace(/opt_ok hide/, 'opt_ok');
            strRow = strRow.replace(/(row-a|row-b)/, 'row_reconcilable');
          }
          /* the total */
          theTotal += theData[i][1];
          /* apply values to detail row */
          strRow = strRow.replace(/rowId/, 'n_' + theData[i][5]);
          strRow = strRow.replace(/{date}/, theData[i][0]);
          strRow = strRow.replace(/{value}/, mlog.base.formatFloat(theData[i][1]));
          strRow = strRow.replace(/{description}/, theData[i][2]);
          strRow = strRow.replace(/{category}/, theData[i][3]);
          strRow = strRow.replace(/{account}/, theData[i][4]);
          res.push(strRow);
        }
        /* end of data, put total */
        strRow = tp.tRowTotal.replace(/{totalvalue}/, mlog.base.formatFloat(theTotal));
        strRow = strRow.replace(/{entriescount}/, data_len);
        res.push(strRow);
        /* assemble table */
        content = content.replace(/{entriesContent}/, res.join(''));
        var maxPage = theData.pop().maxPage || 1;
        content += mlog.entriesControl.buildPaginator(maxPage) + '<br />';
      }
      else {
        content = '<h1>' + mlog.translator.get('no data') + '</h1>';
      }
      $('#report').html(content);
      $('#toggle_summary').click(function(){
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
        _hideSummary = !_hideSummary;
      });
      /* bind click event on each column */
      $('td.entry').click(function(){
        mlog.entriesControl.onClickEntry(this);
      });
    },

    /* sort table column */
    sortCol: function(index){
      _filterOptions.sortReverse = (_filterOptions.sortColIndex != index) ? false : !_filterOptions.sortReverse;
      _filterOptions.sortColIndex = index;
      this.show();
    },

    /* clear entry form */
    clearEntry: function(){
      $('#input_date').val(mlog.base.getCurrentDate());
      $('#input_value').val('');
      $('#input_pending').attr('checked', '');
      $('#input_description').val('');
      $('#input_category').val('');
      $('#input_account').val('');
      $('#input_account_to').val('');
    },

    /* add an entry from input */
    addEntry: function(elem){
      var entry = [$('#input_date').val(), $('#input_value').val(), $('#input_description').val(), $('#input_category').val(), $('#input_account').val(), $('#input_account_to').val()];
      /* is it reconcilable */
      entry[0] += $('#input_pending').attr('checked') ? '?' : '';
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
      for (var i = 1; i <= addCount; i++) {
        /* stylise new entries */
        $('#n_' + (newCount - i)).addClass('new_entry');
      }
      /* initial state and update autocompleters */
      $('#transfer').hide();
      $('#input_date').focus();
      $('#input_pending').attr('checked', '');
      $('#input_category').setOptions({
        data: mlog.categories.getNames()
      });
      $('#input_account').setOptions({
        data: mlog.accounts.getNames()
      });
      $('#input_account_to').val('').setOptions({
        data: mlog.accounts.getNames()
      });
      if ($('#input_auto_clear').attr('checked')) {
        this.clearEntry();
      }
    },
    onPageChange: function(){
      _filterOptions.entriesPerPage = parseInt($('#entriesPerPage option:selected').attr('value') || 50);
      mlog.entriesControl.show(parseInt($('#select_page option:selected').attr('value')));
    },
    reconcileEntry: function(elem){
      var id = elem.parentNode.parentNode.getAttribute('id').substring(2);
      if (confirm(mlog.translator.get('conciliate').toUpperCase() + ': ' + mlog.translator.get('are you sure?'))) {
        mlog.entries.reconcile(id);
        this.show();
        $('#n_' + (mlog.entries.getCount() - 1)).addClass('new_entry');
      }
    },
    /* read options panel and set to variables*/
    updateOptions: function(){
      var selectedCategories = [];
      $.each($('#entries_category_cloud .tagSelect'), function(i, v){
        selectedCategories.push($(v).html());
      });
      var selectedAccounts = [];
      $.each($('#entries_account_cloud .tagSelect'), function(i, v){
        selectedAccounts.push($(v).html());
      });
      _filterOptions.query = $.trim($('#filter_query').val());
      _filterOptions.entriesPerPage = parseInt($('#entriesPerPage option:selected').attr('value') || 50);
      _filterOptions.startDate = $('#filter_date_from').val();
      _filterOptions.endDate = $('#filter_date_until').val();
      _filterOptions.values = parseInt($('#filter_values option:selected').attr('value')) || 0;
      _filterOptions.categories = selectedCategories;
      _filterOptions.accounts = selectedAccounts;
      updateSearches(_filterOptions.query);
    },
    applyOptions: function(){
      this.updateOptions();
      this.show();
    },
    updateTagCloud: function(){
      $('#entries_category_cloud').html(mlog.base.arrayToTagCloud(mlog.categories.getAll(), 1));
      $('#entries_account_cloud').html(mlog.base.arrayToTagCloud(mlog.accounts.getAll(), 2));
      // mark selected categories
      if (_filterOptions.categories.length > 0) {
        var regex = eval('/(' + _filterOptions.categories.join('|') + ')/i');
        if (regex !== undefined) {
          $.each($('#entries_category_cloud').children(), function(i, v){
            if (regex.test($(v).html()))
              $(v).addClass('tagSelect');
          });
        }
      }
      // mark selected accounts
      if (_filterOptions.accounts.length > 0) {
        regex = eval('/(' + _filterOptions.accounts.join('|') + ')/i');
        if (regex !== undefined) {
          $.each($('#entries_account_cloud').children(), function(i, v){
            if (regex.test($(v).html()))
              $(v).addClass('tagSelect');
          });
        }
      }
    },
    resetFilter: function(){
      resetFilterOptions();
      this.show();
    },
    /* build paginator */
    buildPaginator: function(numberOfPages){
      var currentPg = _filterOptions.pageNumber;
      var maxPg = numberOfPages || 1;
      var entriesPerPage = _filterOptions.entriesPerPage;
      var str = [];
      var perPageOption = [20, 50, 100, 200, 500, 1000]; // entries per page options
      str.push('<div class="pagination">');
      str.push('<select id="entriesPerPage" onchange="mlog.entriesControl.onPageChange()">');
      for (var i = 0; i < perPageOption.length; i++) {
        if (perPageOption[i] == entriesPerPage) {
          str.push('<option value="' + perPageOption[i] + '" selected="selected">' + perPageOption[i] + '</option>');
        }
        else {
          str.push('<option value="' + perPageOption[i] + '">' + perPageOption[i] + '</option>');
        }
      }
      str.push('</select>&nbsp;<span class="msg">' +
      mlog.translator.get('per page') +
      '</span>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
      var prevPg = (currentPg - 1 > 0) ? currentPg - 1 : currentPg;
      str.push('<a onclick="mlog.entriesControl.show(' + prevPg + ')">&laquo;</a>');
      str.push('&nbsp;' + mlog.translator.get('page') + '&nbsp;');
      str.push('<select id="select_page" onchange="mlog.entriesControl.onPageChange()">');
      for (i = 1; i <= maxPg; i++) {
        if (i == currentPg) {
          str.push('<option value="' + i + '" selected="selected">' + i + '</option>');
        }
        else {
          str.push('<option value="' + i + '">' + i + '</option>');
        }
      }
      str.push('</select>&nbsp;' + mlog.translator.get('of') + '&nbsp;' + maxPg + '&nbsp;');
      var nextPg = (currentPg + 1 <= maxPg) ? currentPg + 1 : currentPg;
      str.push('<a onclick="mlog.entriesControl.show(' + nextPg + ')">&raquo;</a>');
      str.push('</div>');
      return str.join('');
    }
  };
}();
