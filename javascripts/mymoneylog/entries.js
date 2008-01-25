// entries
mlog.entries = function(){
  var entries = [];
  var currentDate = mlog.base.getCurrentDate();
  var _add = function(entry){
    if (entry) {
      // parse date
      entry[0] = entry[0].replace(/[^0-9-]/, '') || '-';
      // parse value
      if (typeof entry[1] !== 'number') {
        entry[1] = mlog.base.toFloat(entry[1]);
      }
      // parse description
      entry[2] = entry[2] || '';
      entry[2] = entry[2].strip() || '';
      // parse category
      entry[3] = entry[3] || '';
      entry[3] = entry[3].strip().toLowerCase();
      // parse account
      entry[4] = entry[4] || '';
      entry[4] = entry[4].strip().toLowerCase();
      // id
      entry[5] = entries.length;

      entries.push(entry.slice(0));
      // update category
      if (entry[3] != '') {
        mlog.categories.add(entry[3]);
      }
      // update account and amount
      if (entry[4] != '') {
        if (entry[0] <= currentDate) {
          mlog.accounts.add(entry[4], entry[1]);
        }
        else {
          // do not update future amount
          mlog.accounts.add(entry[4], 0);
        }
      }
    }
  };

  // filter an array
  // @param array entriesArray, string filter, bool isRegex
  var filterByDescription = function(entriesArray,filter,isRegex) {
    var res = [];
    try {
      if (filter && isRegex) {
        filter = eval('/' + filter + '/i');
      }
      var str = '';
      if (filter) {
        for (var i = 0; i < entriesArray.length; i++) {
          str = entriesArray[i].join('/t');
          if (isRegex) {
            if (!filter.test(str))
              continue;
          } else {
            if (str.toLowerCase().indexOf(filter.toLowerCase()) == -1)
              continue;
          }
          res.push(entriesArray[i]);
        }
        return res;
      }
    }
    catch (e) {}
    return [];
  }
  var filterByDate = function(entriesArray,dtStart,dtEnd) {
    dtEnd = dtEnd || dtStart;
    var res = [];
    var all = entriesArray.clone();
    mlog.base.arraySort(all, 0); // sort by date
    for (var i=0;i<all.length;i++) {
      if (all[i][0]>=dtStart && all[i][0]<=dtEnd) {
        res.push(all[i]);
      }
    }
    return res;
  };

  /* public methods */
  return {
    read: function(){
      var temp;
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
        // Normalize
        temp = rawData[i].split(mlog.base.dataFieldSeparator);
        _add(temp);
      };
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
        txt = entries[i][0] + mlog.base.dataFieldSeparator +
          mlog.base.floatToString(entries[i][1]) + mlog.base.dataFieldSeparator; // format value
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
      var entry = entries.splice(id, 1)[0];
      // reorder index
      if (entry) {
        for (var i = entry[5]; i < entries.length; i++) {
          entries[i][5] = i;
        }
      }
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
      return filterByDate(entries,dtStart,dtEnd);
    },
    getByDescription: function(filter,isRegex,withFuture){
      var future = withFuture || false;
      if (future) {
        return filterByDescription(entries,filter,isRegex);
      }
      /* return until current date */
      return filterByDate(
        filterByDescription(entries,filter,isRegex),
        '1990-01-01',
        mlog.base.getCurrentDate()
        );
    },
    getUntilPresent: function() {
      return mlog.entries.getByDate('1990-01-01',mlog.base.getCurrentDate());
    }
  };
}();
