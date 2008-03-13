// entries
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
        entry[2] = entry[2] || '';
        entry[2] = entry[2].strip() || '';
        // parse category
        entry[3] = entry[3] || '';$
        entry[3] = entry[3].strip().toLowerCase();
        // parse account
        entry[4] = entry[4] || '';
        entry[4] = entry[4].strip().toLowerCase();
        // id
        entry[5] = entries.length;

        entries.push(entry);
        // update category list
        if (entry[3] != '') {
          mlog.categories.add(entry[3]);
        }
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
        srcData = $("dataframe").contentWindow.document.getElementById('data');
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
        /* if there was no data file, create it and reload iframe */
        this.save();
        $("dataframe").src = $("dataframe").src;
      }
    },
    /*
     * Get entries
     */
    getAll: function(){
      if (entries.length==0) {
        this.read();
      }
      return entries.clone();
    },
    getAllAsText: function() {
      var txt = '';
      var tmp = [];
      for (var i = 0; i < entries.length; i++) {
        // remove index
        // format date and value
        txt = entries[i][0] +(entries[i][6]?'?':'')+ mlog.base.dataFieldSeparator +
          mlog.base.floatToString(entries[i][1]) + mlog.base.dataFieldSeparator;
        // push description, category and account
        tmp.push(txt + entries[i].slice(2,5).join(mlog.base.dataFieldSeparator));
      }
      txt = tmp.join('\n') + '\n';
      return txt;
    },
    save: function(){
      var result = mlog.base.saveFile( mlog.base.getDataPathName(),
                                      '<pre id="data">\n'+this.getAllAsText()+'</pre>');
      if (result !== true) {
        alert('Could not store the data.');
      }
    },
    backup: function(){
      var result = mlog.base.saveFile( mlog.base.getDataPathName() + '.old',
                                      '<pre id="data">\n'+this.getAllAsText()+'</pre>');
      if (result !== true) {
        alert('Could not backup the data.');
      }
    },
    get: function(id){
      return entries[id];
    },
    add: function(entry){
      _add(entry);
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
        if (entries[i][0]>=dtStart && entries[i][0]<=dtEnd) {
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
            if (entries[i][0]>dtEnd)
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
      this.add(entry);
    }
  };
}();
