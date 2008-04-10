/**
 * entries_control.js - entries controller
 * @author Ricardo Nishimura - 2008
 */
mlog.entriesControl = function() {
  var htmlTemplate = null;
  var sortColIndex = 0;
  var sortColRev = true;
  var entryCalendar;
  return {
    categoryAutoCompleter: null,
    accountAutoCompleter: null,
    accountToAutoCompleter: null,
    /* initialize template, completers, datepicker... */
    init: function() {
      /* initialize: get template, create completers, datepicker... */
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
      } else {
        return; /* it's already initialized */
      };
      mlog.entries.getAll(); /* initialize data */
      /* initialize auto completers */
      $('#input_category').autocomplete(
          mlog.categories.getNames(),
          { minChars: 0, selectFirst: false }
        );
      $('#input_account').autocomplete(
          mlog.accounts.getNames(),
          { minChars: 0, selectFirst: false }
        );
      $('#input_account_to').autocomplete(
          mlog.accounts.getNames(),
          { minChars: 0, selectFirst: false }
        );
      /* initialize datepicker */
      Calendar.setup({
        inputField: "input_date",
        ifFormat: "%Y-%m-%d",
        daFormat: "%Y-%m-%d",
        showsTime: false,
        button: "input_date",
        singleClick: true,
        step: 2,
        weekNumbers: false
      });
      /* initial date value */
      $('#input_date').val(mlog.base.getCurrentDate());
      /* attach on blur event for account transfers */
      $('#input_category').blur(this.onBlurAccount);
      $('#filter_query').keyup(mlog.entriesControl.show);
      $('#opt_regex').click(mlog.entriesControl.show);
      $('#opt_future').click(mlog.entriesControl.show);
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
      /* some effects  */
      $(this).fadeOut().fadeIn();
    },
    /* remove an entry */
    removeEntry: function(elem){
      var lineId = elem.parentNode.parentNode.getAttribute('id');
      var lineData = mlog.entries.remove(lineId);
      this.show();
      this.updateInputEntry(lineData);
    },
    /* display on input when clicked */
    onClickEntry: function(elem){
      var id = elem.parentNode.getAttribute('id');
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
      var accounts = mlog.accounts.getAll();
      mlog.base.arraySort(accounts,0);
      var accTotal = 0;
      var maxValue = 0;
      for (var i=0;i<accounts.length;i++) {
        if (accounts[i][0]!='' && accounts[i][1]!=0) {
          maxValue = Math.abs(accounts[i][1])>maxValue?Math.abs(accounts[i][1]):maxValue;
        }
      }
      maxValue = maxValue>=100?maxValue:100; /* at least more then 100 */
      for (var i=0;i<accounts.length;i++) {
        strRow = tpSum.tRow;
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
        accTotal += accounts[i][1];
      }
      strRow = tpSum.tRowTotal;
      strRow = strRow.replace(/{account_id}/,mlog.translator.get('total'));
      strRow = strRow.replace(/{account_total}/,mlog.base.formatFloat(accTotal));
      res.push(strRow);
      res = res.join('');
      return res;
    },
    /* display the entries */
    show: function(page){
      var nPage = (typeof page == 'number')? page : 1;
      var nPages = 1;
      var t = [];
      mlog.base.activateMenu('entries');
      var theTotal = 0;
      var res = [];
      mlog.entriesControl.init();

      var theData;
      var showFuture = $('#opt_future:checked').length>0;
      var filter = $('#filter_query').val();
      var isRegex = $('#opt_regex:checked').length>0;
      theData = mlog.entries.getByFilter(filter,isRegex,showFuture);

      var currentDate = mlog.base.getCurrentDate();
      var strRow = '';
      var tp = htmlTemplate.entries;
      var content = htmlTemplate.main;
      var maxLenght = $('#max_entries').val() || 100;
      nPages = Math.ceil(theData.length/maxLenght);
      var odd = true;
      if (theData.length > 0) {
        mlog.base.arraySort(theData, sortColIndex);
        if (sortColRev) {
          theData.reverse();
        }
        /* build summary */
        content = content.replace(/{summaryContent}/, mlog.entriesControl.getSummary());

        /* build entries */
        res.push(tp.tHead);
        var i = 0;
        if (nPage>1) {
          i = (nPage-1)*maxLenght;
          i = i>(theData.length-1)?0:i;
        }
        for (i; i < theData.length; i++) {
          if ((res.length-1)>=maxLenght) {
            break;
          }
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
          strRow = strRow.replace(/rowId/, theData[i][5]);
          strRow = strRow.replace(/{date}/, theData[i][0]);
          strRow = strRow.replace(/{value}/, mlog.base.formatFloat(theData[i][1]));
          strRow = strRow.replace(/{description}/, theData[i][2]);
          strRow = strRow.replace(/{category}/, theData[i][3]);
          strRow = strRow.replace(/{account}/, theData[i][4]);
          /* is reconcilable? */
          if (theData[i][6]) {
            strRow = strRow.replace(/opt_reconcile hide/,'opt_reconcile');
          }
          res.push(strRow);
        }
        /* end of data, show total */
        strRow = tp.tRowTotal;
        strRow = strRow.replace(/{totalvalue}/, mlog.base.formatFloat(theTotal));
        strRow = strRow.replace(/{entriescount}/, res.length-1);
        res.push(strRow);
        /* assemble table */
        var res = res.join('');
        content = content.replace(/{entriesContent}/, res);
        content += mlog.entriesControl.getPaginator(nPage,nPages)+'<br/>';
      }
      else {
        content = '<h1>' + mlog.translator.get('no data') + '</h1>';
      }
      $('#report').html(content);
      res = null;
      $('#toggle_summary').click( function() {
        $(this).toggleClass('hide_next').toggleClass('show_next').next('div').slideToggle("slow");
      });
},

    /* sort table column */
    sortCol: function(index){
      sortColRev = (sortColIndex != index) ? false : !sortColRev;
      sortColIndex = index;
      this.show();
    },

    /* add an entry from input */
    addEntry: function(elem){
      var inputValue = $('#input_value').val();
      var nTimes = 1; /* number of inserts */
      var entriesCount = mlog.entries.getCount();
      /* parse value */
      if (inputValue.indexOf('*')>0) {
        /* if multiply * : insert n times the same value */
        var args = inputValue.split('*');
        inputValue = args[0];
        nTimes = args[1] || '1';
        nTimes = parseInt(nTimes);
        inputValue = mlog.base.toFloat(inputValue);
      } else
      if (inputValue.indexOf('/') > 0) {
        /* if divided / : insert n times the value/nTimes */
        var args = inputValue.split('/');
        inputValue = args[0];
        nTimes = args[1] || '1';
        nTimes = parseInt(nTimes);
        inputValue = Math.round(mlog.base.toFloat(inputValue)/nTimes*100)/100;
      } else {
        inputValue = mlog.base.toFloat(inputValue);
      }
      var original = [];
      original[0] = $('#input_date').val();
      original[1] = inputValue;
      original[2] = $('#input_description').val();
      original[3] = $('#input_category').val();
      original[4] = $('#input_account').val();
      reconcilable = ($('#input_date').val().charAt(10)=='?')||false;
      var entry = [];
      var toAccount = $('#input_account_to').val();
      for (var i=0; i<nTimes; i++) {
        entry = original.slice(0);
        if (i>0) {
          /* add month to date */
          dt = mlog.base.addMonths(mlog.base.stringToDate(original[0].substring(0,10)),i);
          entry[0] = mlog.base.dateToString(dt);
          entry[0] += reconcilable?'?':'';
        }
        if (nTimes>1) {
          entry[2] = original[2] + ' ' + (i+1) + '/' + nTimes;
        }
        /* add due data description */
        entry[2] += (reconcilable)?(' - ' + mlog.translator.get('due to') + ' ' + entry[0].substring(0,10)):'';
        mlog.entries.add(entry);
        /* if category is empty and has toAccount, do a transfer */
        if (entry[3]=='' && toAccount!=='' && entry[1] != 0) {
          entry[1] = original[1]*-1;
          entry[2] = entry[2] + ' - ' + entry[4];
          entry[4] = toAccount;
          mlog.entries.add(entry);
        }
      }
      /* refresh entries */
      this.show();
      /* blink add button */
      $(elem).fadeOut('fast').fadeIn('fast');
      /* apply style to new entry */
      var newEntry = null;
      entriesCount = mlog.entries.getCount() - entriesCount;
      for (var i=1; i<=entriesCount; i++) {
        /* get the new entry element */
        $('#'+(mlog.entries.getCount()-i)).addClass('new_entry');
      }
      /* initial state */
      $('#input_account_to').val('');
      $('#transfer').hide();
      $('#input_date').focus();
    },
    /* toggle 'to account' */
    onBlurAccount: function() {
      if ($('#input_category').val() == '') {
        $('#transfer').show();
      } else {
        $('#transfer').hide();
      }
    },
    /* build paginator */
    getPaginator: function(cPage,max) {
      var currentPg = cPage || 1;
      var maxPg = max || 1;
      var previousPg = (currentPg-1)>0?(currentPg-1):1;
      var nextPg = (currentPg+1)<=maxPg?(currentPg+1):maxPg;
      var str = [];
      str.push('<div class="pagination">');
      str.push('<a onclick="mlog.entriesControl.show('+previousPg+')">&laquo;</a>');
      str.push('&nbsp;'+mlog.translator.get('page')+'&nbsp;');
      str.push('<select id="select_page" onchange="mlog.entriesControl.onPageChange()">');
      for (var i=1;i<=maxPg;i++) {
        if (i==currentPg) {
          str.push('<option value="'+i+'" selected="selected">'+i+'</option>');
        } else {
          str.push('<option value="'+i+'">'+i+'</option>');
        }
      }
      str.push('</select>&nbsp;'+mlog.translator.get('of')+'&nbsp;'+maxPg+'&nbsp;');
      str.push('<a onclick="mlog.entriesControl.show('+nextPg+')">&raquo;</a>');
      str.push('</div>');
      return str.join('');
    },
    onPageChange: function() {
        mlog.entriesControl.show(parseInt($('#select_page').val()));
    },
    reconcileEntry: function(elem){
      var id = elem.parentNode.parentNode.getAttribute('id');
      mlog.entries.reconcile(id);
      this.show();
    }
  };
}();
