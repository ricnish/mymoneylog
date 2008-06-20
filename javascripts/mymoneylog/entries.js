/**
 * entries.js
 * @author Ricardo Nishimura - 2008
 */
mlog.entries = function(){
  var entries = [];
  var currentDate = mlog.base.getCurrentDate();
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
        entry[6] = (entry[0].charAt(10)=='?')||false;
        // parse date
        entry[0] = entry[0].replace(/[^0-9-]/, '') || '-';
        if (entry[6]) {
          // if is reconcilable, set past date to current date
          entry[0]=(entry[0]<currentDate)?currentDate:entry[0];
        }
        // parse value
        if (typeof entry[1] !== 'number') {
          entry[1] = mlog.base.toFloat(entry[1]);
        }
        // parse description
        entry[2] = $.trim(entry[2]);
        // parse category
        entry[3] = $.trim(entry[3]).toLowerCase();
        // update category list
        if (entry[3] != '') {
          // deals with multiple categories
          var str = entry[3].split($.trim(mlog.base.categorySeparator));
          var tmp = [];
          var value = '';
          for (var i=0;i<str.length;i++) {
            value = $.trim(str[i]);
            if (value != '') {
              tmp.push(value);
              mlog.categories.add(value);
            }
          }
          entry[3] = tmp.join(mlog.base.categorySeparator);
        }
        // parse account
        entry[4] = $.trim(entry[4]).toLowerCase();
        // id
        entry[5] = entries.length;
        entries.push(entry);
        // update account list
        if (entry[4] != '') {
          if ((entry[0] <= currentDate) && !(entry[6])) {
            mlog.accounts.add(entry[4], entry[1]);
          }
          else {
            // do not update future amount or reconcilable
            mlog.accounts.add(entry[4]);
          }
        }
      } catch(e) {};
    }
  };
  /* remove and return an entry */
  var _remove = function(id) {
    var entry = entries.splice(id, 1)[0];
    // reorder index
    if (entry) {
      for (var i = entry[5]; i < entries.length; i++) {
        entries[i][5] = i;
      }
    }
    return entry;
  }

  /* public methods */
  return {
    read: function(){
      entries = [];
      mlog.accounts.reset();
      var srcData = null;
      try {
        srcData = document.getElementById('dataframe').contentWindow.document.getElementById('data');
      } catch(e) {};
      var rawData = '';
      if (srcData) {
        rawData = srcData.innerHTML;
      } else {
        rawData = mlog.translator.get('datasample');
      }
      rawData = rawData.split(mlog.base.dataRecordSeparator);

      for (var i = 0; i < rawData.length; i++) {
        if (rawData[i].indexOf(mlog.base.commentChar) === 0) {
          continue;
        }
        if (rawData[i].indexOf(mlog.base.dataFieldSeparator) == -1) {
          continue;
        }
        // add as array
        _add( rawData[i].split(mlog.base.dataFieldSeparator) );
      };
      if (!srcData) {
        /* if there was no data file, set source to empty */
        $("#dataframe").attr('src', '');
      }
    },
    /*
     * Get entries
     */
    getAll: function(){
      if (entries.length==0) {
        this.read();
      }
      return entries.slice(0);
    },
    /* convert entries array to string */
    toString: function(startdate) {
      var startDate = startdate || '1980-01-01';
      var txt = '';
      var tmp = [];
      var initialAccounts = mlog.accountsClass();
      for (var i = 0; i < entries.length; i++) {
        if (entries[i][0]<startDate) {
          // set initial accounts values
          initialAccounts.add(entries[i][4],entries[i][1]);
          continue;
        }
        // remove index
        // format date and value
        txt = entries[i][0] +(entries[i][6]?'?':'')+ mlog.base.dataFieldSeparator +
          mlog.base.floatToString(entries[i][1]) + mlog.base.dataFieldSeparator;
        // push description, category and account
        tmp.push(txt + entries[i].slice(2,5).join(mlog.base.dataFieldSeparator));
      }
      initialAccounts = initialAccounts.getAll();
      if (initialAccounts.length>0) {
        txt = '';
        for (var i=0; i<initialAccounts.length;i++) {
          if (initialAccounts[i][0] != '') {
            txt += startDate + mlog.base.dataFieldSeparator +
              mlog.base.floatToString(initialAccounts[i][1]) + mlog.base.dataFieldSeparator +
              mlog.translator.get('initial value') + mlog.base.dataFieldSeparator +
              mlog.base.dataFieldSeparator +
              initialAccounts[i][0] + '\n';
          }
        }
      }
      txt += tmp.join('\n') + '\n';
      return txt;
    },
    exportFromStartDate: function(startdate) {
      var filename = mlog.base.getDataPathName().replace(/.html/,'_'+startdate+'.html');
      var result = mlog.base.saveFile(filename,
                                      '<pre id="data">\n'+this.toString(startdate)+'</pre>');
      if (!result) {
        alert(mlog.translator.get('could not store the data'));
        return;
      }
      alert(mlog.translator.get('data exported to file:')+'\n'+filename);
    },
    save: function(){
      var result = mlog.base.saveFile(mlog.base.getDataPathName(),
                                      '<pre id="data">\n'+this.toString()+'</pre>');
      if (!result) {
        alert(mlog.translator.get('could not store the data'));
      }
    },
    backup: function(){
      var result = mlog.base.saveFile(mlog.base.getDataPathName() + '.old',
                                      '<pre id="data">\n'+this.toString()+'</pre>');
      if (!result) {
        alert(mlog.translator.get('could not store the data'));
      }
    },
    get: function(id){
      return entries[id];
    },
    add: function(entry){
      /* number of inserts */
      var nTimes = 1;
      /* parse value */
      if (entry[1].indexOf('*')>0) {
        /* if multiply * : insert n times the same value */
        var args = entry[1].split('*');
        entry[1] = mlog.base.toFloat(args[0]);
        nTimes = parseInt(args[1]) || 1;
      } else
        if (entry[1].indexOf('/') > 0) {
          /* if divided / : insert n times the value/nTimes */
          var args = entry[1].split('/');
          nTimes = parseInt(args[1]) || 1;
          entry[1] = Math.round(mlog.base.toFloat(args[0])/nTimes*100)/100;
        }
        else {
          entry[1] = mlog.base.toFloat(entry[1]);
        }
      var reconcilable = (entry[0].charAt(10)=='?')||false;
      var toAccount = entry[5];
      for (var i=0; i<nTimes; i++) {
        var newEntry = entry.slice(0);
        if (i>0) {
          /* add month to date */
          var dt = mlog.base.addMonths(mlog.base.stringToDate(entry[0].substring(0,10)),i);
          newEntry[0] = mlog.base.dateToString(dt);
          newEntry[0] += reconcilable?'?':'';
        }
        if (nTimes>1) {
          newEntry[2] = entry[2] + ' ' + (i+1) + '/' + nTimes;
        }
        /* add due data description */
        newEntry[2] += (reconcilable)?(' - ' + mlog.translator.get('due to') + ' ' + newEntry[0].substring(0,10)):'';
        _add(newEntry);
        /* if category is empty and has toAccount, do a transfer */
        if (newEntry[3]=='' && toAccount!=='' && newEntry[1] != 0) {
          newEntry[1] = entry[1]*-1;
          newEntry[2] = newEntry[2] + ' - ' + newEntry[4];
          newEntry[4] = toAccount;
          _add(newEntry);
        }
      }
      this.save();
    },
    remove: function(id){
      var entry = _remove(id);
      // update account
      if (entry[4] != '') {
        // do not update future amount
        if (entry[0] <= currentDate) {
          mlog.accounts.add(entry[4],entry[1]*-1);
        }
      }
      this.save();
      return entry;
    },
    getByDate: function(dtStart,dtEnd) {
      dtEnd = dtEnd || dtStart;
      var res = [];
      for (var i=0;i<entries.length;i++) {
        if (entries[i][0] >= dtStart && entries[i][0] <= dtEnd) {
          res.push(entries[i]);
        }
      }
      return res;
    },
    getByFilter: function(filter,isRegex,withFuture){
      var res = [];
      withFuture = withFuture || false;
      var dtEnd = mlog.base.getCurrentDate();
      try {
        if (filter && isRegex) {
          filter = eval('/' + filter + '/i');
        }
        var str = '';
        for (var i = 0; i < entries.length; i++) {
          str = entries[i].join('/t');
          if (filter) {
            if (isRegex) {
              if (!filter.test(str))
                continue;
            } else {
              if (str.toLowerCase().indexOf(filter.toLowerCase()) == -1)
                continue;
            }
          }
          if (!withFuture) {
            if (entries[i][0] > dtEnd)
              continue;
          }
          res.push(entries[i]);
        }
        return res;
      }
      catch (e) {}
      return res;
    },
    getCount: function() {
      return entries.length;
    },
    /* just remove and add to remove reconcile */
    reconcile: function(id) {
      // private remove to avoid account update
      var entry = _remove(id);
      _add(entry);
      this.save();
    },
    /* summarize last n months */
    getOverview: function(numberOfMonths, untilDate) {
      var nMonths = numberOfMonths || 6;
      var dtEnd = untilDate || mlog.base.getCurrentDate();
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
      for (var i=nMonths;i>=0;i--) {
        var month = mlog.base.addMonths(mlog.base.stringToDate(dtEnd),i*-1);
        month = mlog.base.dateToString(month);
        month = month.slice(0,7);
        months.push(month);
      }
      // initialize total
      for (var i=0;i<categoriesIds.length;i++) {
        total.categories[categoriesIds[i]] = {};
      }
      total.summary[debitId] = {};
      total.summary[creditId] = {};
      total.summary[balanceId] = {};
      total.summary[totalId] = {};
      for (var m=0; m<months.length; m++) {
        total.summary[debitId][months[m]] = 0;
        total.summary[creditId][months[m]] = 0;
        total.summary[balanceId][months[m]] = 0;
        total.summary[totalId][months[m]] = 0;
        for (var i=0;i<categoriesIds.length;i++) {
          total.categories[categoriesIds[i]][months[m]] = 0;
        }
      }
      // process entries
      var categories;
      var month;
      var value;
      var accumulated = 0;
      mlog.base.arraySort(ovEntries,0);
      for (var i=0;i<ovEntries.length;i++) {
        // skip if reconcilable
        if (ovEntries[i][6]) continue;
        month = (ovEntries[i][0]).slice(0, 7);
        value = ovEntries[i][1];
        categories = ovEntries[i][3];
        categories = categories.split(mlog.base.categorySeparator);
        if (categories[0] != '') {
          // sum for each category/tag
          for (var ncat=0;ncat<categories.length;ncat++) {
            total.categories[categories[ncat]][month] += value;
          }
          /* sum credit (if has category) */
          if (value>0) total.summary[creditId][month] += value;
          /* sum debit (if has category) */
          if (value<0) total.summary[debitId][month] += value;
        }
        /* calc balance */
        total.summary[balanceId][month] += value;
        /* sum total */
        accumulated += value;
        total.summary[totalId][month] = accumulated;
      }
      return total;
    }
  };
}();
