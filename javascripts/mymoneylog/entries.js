/**
 * entries.js
 * @author Ricardo Nishimura - 2008
 */
mlog.entries = function(){
  var _entries = [];
  var _currentDate = mlog.base.getCurrentDate();
  // store descriptions to suggest
  var _descriptions = {};
  var _add = function(entryArray){
    if (entryArray) {
      var entry = entryArray.slice(0);
      try {
        /*
         entry:
         0: date: string
         1: value: float
         2: description: string
         3: category: string
         4: account: string
         5: line id: int
         6: is reconcilable: bool
        */
        // is reconcilable
        entry[6] = entry[0].indexOf('?')>-1;
        // parse date
        entry[0] = (entry[0].replace(/[^0-9-]/g, '')).slice(0,10);
        entry[0] = entry[0].length>9? entry[0]: _currentDate;
        if (entry[6]) {
          // if is reconcilable, set past date to current date
          entry[0]=(entry[0]<_currentDate)?_currentDate:entry[0];
        }
        // parse value
        if (typeof entry[1] !== 'number') {
          entry[1] = mlog.base.toFloat(entry[1]);
        }
        // parse description
        entry[2] = $.trim(entry[2]);
        _descriptions[entry[2].toLowerCase()] = 0;
        // parse category
        entry[3] = $.trim(entry[3]).toLowerCase();
        // update category list
        if (entry[3] !== '') {
          // deals with multiple categories
          var str = entry[3].split($.trim(mlog.base.categorySeparator));
          var tmp = [];
          var value = '';
          for (var i=0,j=str.length;i<j;i++) {
            value = $.trim(str[i]);
            if (value !== '') {
              tmp.push(value);
              mlog.categories.add(value);
            }
          }
          entry[3] = tmp.join(mlog.base.categorySeparator);
        }
        // parse account
        entry[4] = $.trim(entry[4]).toLowerCase();
        // id
        entry[5] = _entries.length;
        _entries.push(entry);
        // update account list
        if (entry[4] !== '') {
          if ((entry[0] <= _currentDate) && !entry[6]) {
            mlog.accounts.add(entry[4], entry[1]);
          }
          else {
            // do not update future amount or reconcilable
            mlog.accounts.add(entry[4]);
          }
        }
      } catch(e) {}
    }
  };
  /* remove and return an entry */
  var _remove = function(id) {
    var entry = _entries.splice(id, 1)[0];
    // reorder index
    if (entry) {
      for (var i = entry[5],j=_entries.length;i<j; i++) {
        _entries[i][5] = i;
      }
    }
    // update if not future or reconcilable entry
    if ((entry[0] <= _currentDate) && !entry[6]) {
      mlog.accounts.remove(entry[4],entry[1]);
      mlog.categories.remove(entry[3]);
    }
    return entry;
  };

  /* public methods */
  return {
    read: function(){
      _entries = [];
      mlog.accounts.reset();
      mlog.categories.reset();
      var srcData = null;
      try {
        srcData = document.getElementById('dataframe').contentWindow.document.getElementById('data');
      } catch(e) {}
      var rawData = '';
      if (srcData) {
        rawData = srcData.innerHTML;
      } else {
        rawData = mlog.translator.get('datasample');
      }
      rawData = rawData.split(mlog.base.dataRecordSeparator);

      for (var i = 0, j=rawData.length; i < j; i++) {
        if (rawData[i].indexOf(mlog.base.commentChar) === 0) {
          continue;
        }
        if (rawData[i].indexOf(mlog.base.dataFieldSeparator) == -1) {
          continue;
        }
        // add as array
        _add( rawData[i].split(mlog.base.dataFieldSeparator) );
      }
      if (!srcData) {
        /* if there was no data file, set source to empty */
        $("#dataframe").attr('src', '');
      }
    },
    /*
     * Get entries
     */
    getAll: function(){
      if (_entries.length===0) {
        this.read();
      }
      return _entries.slice(0);
    },
    /* convert entries array to string */
    toString: function(startdate) {
      var startDate = startdate || '1980-01-01';
      var txt = '';
      var tmp = [];
      var initialAccounts = mlog.accountsClass();
      var i,j;
      for (i = 0, j=_entries.length; i < j; i++) {
        if (_entries[i][0]<startDate) {
          // set initial accounts values
          initialAccounts.add(_entries[i][4],_entries[i][1]);
          continue;
        }
        // remove index
        // format date and value
        txt = _entries[i][0] +(_entries[i][6]?'?':'')+ mlog.base.dataFieldSeparator +
          mlog.base.floatToString(_entries[i][1]) + mlog.base.dataFieldSeparator;
        // push description, category and account
        tmp.push(txt + _entries[i].slice(2,5).join(mlog.base.dataFieldSeparator));
      }
      initialAccounts = initialAccounts.getAll();
      txt = '';
      if (initialAccounts.length>0) {
        for (i=0,j=initialAccounts.length; i<j;i++) {
          if (initialAccounts[i][0] !== '') {
            txt += startDate + mlog.base.dataFieldSeparator +
              mlog.base.floatToString(initialAccounts[i][1]) + mlog.base.dataFieldSeparator +
              mlog.translator.get('initial value') + mlog.base.dataFieldSeparator +
              mlog.base.dataFieldSeparator +
              initialAccounts[i][0] + '\n';
          }
        }
      }
      return txt + tmp.join('\n') + '\n';
    },
    exportFromStartDate: function(startdate) {
      var filename = mlog.base.getDataPathName().replace(/data.html/,startdate+'_data.html');
      var result = mlog.base.saveFile(filename,this.toString(startdate));
      if (!result) {
        alert(mlog.translator.get('could not store the data'));
        return;
      }
      alert(mlog.translator.get('data exported to file:')+'\n'+filename);
    },
    save: function(){
      var result = mlog.base.saveFile(mlog.base.getDataPathName(),this.toString());
      if (!result) {
        alert(mlog.translator.get('could not store the data'));
      }
    },
    backup: function(){
      var result = mlog.base.saveFile(mlog.base.getDataPathName() + '.old',this.toString());
      if (!result) {
        alert(mlog.translator.get('could not store the data'));
      }
    },
    get: function(id){
      return _entries[id];
    },
    add: function(entry){
      /* number of inserts */
      var nTimes = 1;
      /* parse value */
      var args;
      if (entry[1].indexOf('*')>0) {
        /* if multiply * : insert n times the same value */
        args = entry[1].split('*');
        entry[1] = mlog.base.toFloat(args[0]);
        nTimes = parseInt(args[1],10) || 1;
      } else
        if (entry[1].indexOf('/') > 0) {
          /* if divided / : insert n times the value/nTimes */
          args = entry[1].split('/');
          nTimes = parseInt(args[1],10) || 1;
          entry[1] = Math.round(mlog.base.toFloat(args[0])/nTimes*100)/100;
        }
        else {
          entry[1] = mlog.base.toFloat(entry[1]);
        }
      var reconcilable = entry[0].indexOf('?')>-1;
      entry[0] = (entry[0].replace(/[^0-9-]/g, '')).slice(0,10) || _currentDate;
      var toAccount = entry[5];
      for (var i=0; i<nTimes; i++) {
        var newEntry = entry.slice(0);
        if (i>0) {
          /* add month to date */
          var dt = mlog.base.addMonths(mlog.base.stringToDate(entry[0]),i);
          newEntry[0] = mlog.base.dateToString(dt);
        }
        newEntry[0] += reconcilable?'?':'';
        if (nTimes>1) {
          newEntry[2] = entry[2] + ' ' + (i+1) + '/' + nTimes;
        }
        /* add due data description if doesn't have */
        if (newEntry[2].indexOf(mlog.translator.get('due to'))<0)
          newEntry[2] += (reconcilable)?(' - ' + mlog.translator.get('due to') + ' ' + newEntry[0].substring(0,10)):'';
        _add(newEntry);
        /* if category is empty and has toAccount, do a transfer */
        if (newEntry[3]==='' && toAccount!=='' && newEntry[1] !== 0) {
          newEntry[1] = entry[1]*-1;
          newEntry[4] = toAccount;
          _add(newEntry);
        }
      }
      this.save();
    },
    remove: function(id){
      var entry = _remove(id);
      this.save();
      return entry;
    },
    getByDate: function(dtStart,dtEnd) {
      dtEnd = dtEnd || dtStart;
      var res = [];
      for (var i=0,j=_entries.length;i<j;i++) {
        if (_entries[i][0] >= dtStart && _entries[i][0] <= dtEnd) {
          res.push(_entries[i]);
        }
      }
      return res;
    },
    getByFilter: function(opt){
      var options = opt || { // default options
        query: '', // text filter or regular expression
        startDate: '2000-01-01', // initial date
        endDate: _currentDate, // final date
        values: 0, // all: 0, debit: -1, credit: 1
        categories: [], // selected categories
        accounts: [], // selected accounts
        sortColIndex: 0, // column to sort
        sortReverse: true, // sort order
        entriesPerPage: 50, // entries per page
        pageNumber:1 // current page
      };
      var res = [];
      try {
        var regex = new RegExp(options.query,'i');
        var regexCat = new RegExp('('+options.categories.join('|')+')','i');
        var regexAcc = new RegExp('('+options.accounts.join('|')+')','i');
        var str = '';
        var i,j;
        for (i = 0, j=_entries.length; i < j; i++) {
          str = _entries[i].join(mlog.base.dataFieldSeparator);
          // filter regular expression
          if (regex!==undefined && !regex.test(str)) {
            continue;
          }
          // filter date range
          if (_entries[i][0] < options.startDate || _entries[i][0] > options.endDate) {
            continue;
          }
          // filter category
          if (regexCat!==undefined && !regexCat.test(_entries[i][3])) {
            continue;
          }
          // filter account
          if (regexAcc!==undefined && !regexAcc.test(_entries[i][4])) {
            continue;
          }
          // filter value
          if (_entries[i][1]*options.values<0) {
            continue;
          }
          res.push(_entries[i]);
        }
        // sort column
        mlog.base.arraySort(res,options.sortColIndex);
        // sort order
        if (options.sortReverse) {
          res.reverse();
        }
        // trim page / entries count
        var iStart = (options.pageNumber-1) * options.entriesPerPage;
        iStart = iStart<res.length?iStart:0;
        var iEnd = iStart+options.entriesPerPage;
        var data = [];
        for (i=iStart,j=res.length;i<iEnd && i<j; i++) {
          data.push(res[i]);
        }
        // add the maximum page number at tail
        data.push({maxPage: Math.ceil(res.length/options.entriesPerPage)});
        return data;
      }
      catch (e) {return [];}
      return res;
    },
    getCount: function() {
      return _entries.length;
    },
    /* just remove and add to remove reconcile */
    reconcile: function(id) {
      // private remove to avoid account update
      var entry = _remove(id);
      _add(entry);
      this.save();
    },
    /* summarize last n months */
    getCategoriesOverview: function(numberOfMonths, untilDate) {
      var nMonths = numberOfMonths||1;
      var dtEnd = untilDate || _currentDate;
      var dtStart = mlog.base.addMonths(mlog.base.stringToDate(dtEnd),nMonths*-1);
      dtStart.setDate(1);
      dtStart = mlog.base.dateToString(dtStart);
      var ovEntries = mlog.entries.getByDate(dtStart,dtEnd);
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
      var month;
      var i,ilen=categoriesIds.length;
      for (i=nMonths;i>=0;i--) {
        month = mlog.base.addMonths(mlog.base.stringToDate(dtEnd),i*-1);
        month = mlog.base.dateToString(month);
        month = month.slice(0,7);
        months.push(month);
      }
      // initialize total
      for (i=0;i<ilen;i++) {
        total.categories[categoriesIds[i]] = {};
      }
      total.summary[debitId] = {};
      total.summary[creditId] = {};
      total.summary[balanceId] = {};
      total.summary[totalId] = {};
      for (var m=0,l=months.length; m<l; m++) {
        total.summary[debitId][months[m]] = 0;
        total.summary[creditId][months[m]] = 0;
        total.summary[balanceId][months[m]] = 0;
        total.summary[totalId][months[m]] = 0;
        for (i=0;i<ilen;i++) {
          total.categories[categoriesIds[i]][months[m]] = 0;
        }
      }
      // process entries
      var categories;
      var value;
      var accumulated = 0;
      ovEntries.sort();
      for (i=0,ilen=ovEntries.length;i<ilen;i++) {
        // skip if reconcilable
        if (ovEntries[i][6]) {
          continue;
        }
        month = ovEntries[i][0].slice(0, 7);
        value = ovEntries[i][1];
        categories = ovEntries[i][3];
        categories = categories.split(mlog.base.categorySeparator);
        if (categories[0] !== '') {
          // sum for each category/tag
          for (var ncat=0,l=categories.length;ncat<l;ncat++) {
            total.categories[categories[ncat]][month] += value;
          }
          /* sum credit (if has category) */
          if (value>0) {
            total.summary[creditId][month] += value;
          }
          /* sum debit (if has category) */
          if (value<0) {
            total.summary[debitId][month] += value;
          }
        }
        /* calc balance */
        total.summary[balanceId][month] += value;
        /* sum total */
        accumulated += value;
        total.summary[totalId][month] = accumulated;
      }
      return total;
    },
    getAccountsOverview: function(numberOfMonths, untilDate, selectedAccounts) {
      //return data: array [['2000-01-01',[['account name',value,nElements],...]],...]
      //n - data record:
      //  0 - date '2000-01-01'
      //  1 - array:
      //    n - account record
      //      0 - account name
      //      1 - value
      //      2 - number of elements
      var data = [];
      var nMonths = numberOfMonths;
      var dtEnd = untilDate || _currentDate;
      var accountsParam = selectedAccounts || [];
      accountsParam.sort();
      // calculate start date
      var dtStart = mlog.base.addMonths(mlog.base.stringToDate(dtEnd),nMonths*-1);
      dtStart.setDate(1);
      dtStart = mlog.base.dateToString(dtStart);
      var ovEntries = mlog.entries.getAll();
      ovEntries.sort();
      var ovLen = ovEntries.length;
      var acc = mlog.accountsClass();
      var i,j;
      try {
        var regexAcc = new RegExp('('+mlog.accounts.getNames().join('|')+')','i');
        // initialize accounts
        for (i=0,j=accountsParam.length;i<j;i++) {
          if (regexAcc.test(accountsParam[i])) {
            acc.add(accountsParam[i],0);
          }
        }
        if (acc.getNames().length<1) {
          return null;
        }
        regexAcc = new RegExp('('+accountsParam.join('|')+')','i');
        var withTotal = true;
        if (regexAcc!==undefined) {
          withTotal = regexAcc.test(mlog.translator.get('total'));
        }
        // add loop until start date
        for (i=0;i<ovLen;i++) {
          if (ovEntries[i][0]<=dtStart) {
            // filter account
            if (!regexAcc.test(ovEntries[i][4])) {
              continue;
            }
            acc.add(ovEntries[i][4],ovEntries[i][1]);
          }
          else {
            break;
          }
        }
        data.push([dtStart,withTotal?acc.getAllwithTotal():acc.getAll()]);
        var tmpDate = mlog.base.stringToDate(dtStart);
        tmpDate.setHours(1); // avoid daylight saving calc
        tmpDate.setDate(tmpDate.getDate()+1); // add a day
        var nextDate = mlog.base.dateToString(tmpDate);
        // build accounts balance
        if (i==ovLen && nextDate<dtEnd) {
          // loop to build accounts row
          while (nextDate<=dtEnd) {
            data.push([nextDate,withTotal?acc.getAllwithTotal():acc.getAll()]);
            // increment the nextDate
            tmpDate.setDate(tmpDate.getDate()+1); // add a day
            nextDate = mlog.base.dateToString(tmpDate);
          }
        } else {
          // build account's transactions, starting from previous loop i
          for (i;i<ovLen;i++){
            // stop if out of range
            if (ovEntries[i][0]>dtEnd) {
              data.push([nextDate,withTotal?acc.getAllwithTotal():acc.getAll()]);
              break;
            }
            // filter account
            if (!regexAcc.test(ovEntries[i][4])) {
              continue;
            }
            // loop to build accounts row
            while ((ovEntries[i][0]>nextDate) && (nextDate<=dtEnd)) {
              data.push([nextDate,withTotal?acc.getAllwithTotal():acc.getAll()]);
              // increment the nextDate
              tmpDate.setDate(tmpDate.getDate()+1); // add a day
              nextDate = mlog.base.dateToString(tmpDate);
            }
            // add entry to account's date
            if (ovEntries[i][0]==nextDate) {
              acc.add(ovEntries[i][4],ovEntries[i][1])
              if (i==ovEntries.length-1) {
                data.push([nextDate,withTotal?acc.getAllwithTotal():acc.getAll()]);
              }
            }
          }
        }
        return data;
      }
      catch(e) {
        return null;
      }
    },
    // return description´s array
    getDescriptions: function() {
      var descr = [];
      for (var description in _descriptions) {
        descr.push(description);
      }
      return descr.sort();
    }
  };
}();
