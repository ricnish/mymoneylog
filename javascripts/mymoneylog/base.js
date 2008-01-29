
mlog.base = function() {
  // private:
  // Returns null if it can't do it, false if there's an error, true if it saved OK
  var ieSaveFile = function(filePath,content) {
    try {
      var fso = new ActiveXObject("Scripting.FileSystemObject");
    } catch(ex) {
      return null;
    }
    var file = fso.OpenTextFile(filePath,2,true,-1);
    file.Write(content);
    file.Close();
    return true;
  };
  // Returns null if it can't do it, false if there's an error, true if it saved OK
  var mozillaSaveFile = function(filePath,content) {
    if(window.Components) {
      try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filePath);
        if(!file.exists())
          file.create(0,0664);
        var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        out.init(file,0x20|0x02,00004,null);
        out.write(content,content.length);
        out.flush();
        out.close();
        return true;
      } catch(ex) {
        return false;
      }
    }
    return null;
  };
  var javaSaveFile = function(filePath,content)
  {
    try {
      if(document.applets["TiddlySaver"])
        var res = document.applets["TiddlySaver"].saveFile(filePath,"UTF-8",content);
        if (res>0)
          return true;
    } catch(ex) {
    }
    try {
      var s = new java.io.PrintStream(new java.io.FileOutputStream(filePath));
      s.print(content);
      s.close();
    } catch(ex) {
      return null;
    }
    return true;
  }

  // public:
  return {
    /* begin config parameters */
    dataFieldSeparator: '\t',
    dataRecordSeparator: /[\n\r]+/,
    commentChar: '#',
    centsChar: '.',
    thousandChar: ',',
    dataFileName: 'data.html',
    /* end config parameters */
    getDataPathName: function() {
      var filename = document.location.pathname;
      if (filename.indexOf('\\')!=-1) {
        filename = filename.replace(/\\/g,"/");
      }
      filename = filename.split('/');
      filename[filename.length-1] = mlog.base.dataFileName;
      filename = filename.join('/');
      return filename;
    },
    saveFile: function(filePath, content){
      if (navigator.appVersion.indexOf("Win")!=-1) {
        // windows filesystem issues
        if (filePath.charAt(0) == '/') {
          filePath = filePath.slice(1);
        }
        filePath = filePath.replace(/\//g,"\\");
      }
      if (Prototype.Browser.Gecko)
        return mozillaSaveFile(filePath, content);
      if (Prototype.Browser.IE)
        return ieSaveFile(filePath, content);
      return javaSaveFile(filePath, content);
    },
    // sort array by an index
    arraySort: function(theArray, colIndex){
      var i = colIndex || 0;
      // sort function
      var sortFn = function(a, b){
        a = a[i];
        b = b[i];
        try {
          if (typeof a[i] == 'string') {
            a = a.toLowerCase();
            b = b.toLowerCase();
          }
        }
        catch (e) {
        }
        try { // IE6...
          if (a < b) {
            return -1;
          }
          else
            if (a > b) {
              return 1;
            }
        }
        catch (e2) {
        }
        return 0;
      };
      theArray.sort(sortFn);
    },
    floatToString: function(num) {
      num = (Math.round(num * 100) / 100).toString();
      num += (num.indexOf('.') == -1) ? '.00' : '00';
      num = num.substring(0, num.indexOf('.') + 3);
      num = num.replace('.', mlog.base.centsChar);
      while (mlog.base.thousandChar && num.search(/[0-9]{4}/) > -1) {
        num = num.replace(/([0-9])([0-9]{3})([^0-9])/, '$1' + mlog.base.thousandChar + '$2$3');
      }
      return num;
    },
    formatFloat: function(num){
      var myClass = (num < 0) ? 'neg' : 'pos';
      return '<span class="' + myClass + '">' + mlog.base.floatToString(num) + '<\/span>';
    },
    sortCol: function(control, index){
      // if the same, flip reverse state
      control.sortColRev = (control.sortColIndex == index) ? control.sortColRev ^= true : false;
      control.sortColIndex = index;
      control.show();
    },
    toFloat: function(str) {
      var num = str;
      num = num || '0';
      num = num.replace(/[.,]([0-9])$/, '@$1');
      num = num.replace(/[.,]([0-9][0-9])$/, '@$1');
      num = num.replace(/[^0-9@+-]/g, '');
      num = parseFloat(num.replace('@', '.'));
      return num;
    },
    /* add n months to a date */
    addMonths: function(dt,nMonth) {
      var day = dt.getDate();
      dt.setMonth(dt.getMonth() + nMonth);
      if (dt.getDate() < day) {
        dt.setDate(1);
        dt.setDate(dt.getDate() - 1);
      }
      return dt;
    },
    /* parse 'YYYY-mm-dd' to date */
    stringToDate: function(str) {
      return new Date(str.replace(/-/g,'/'))
    },
    /* convert date to 'YYYY-mm-dd' string format */
    dateToString: function(dt) {
      var m = dt.getMonth()+1;
      m = (m < 10) ? ("0" + m) : m;
      var d = dt.getDate();
      d = (d <10) ? ("0" + d) : d;
      return dt.getFullYear() + '-' + m + '-' + d;
    },
    getCurrentDate: function(){
      return this.dateToString(new Date());
    },
    activateMenu: function(menuId){
      var menu = $('menu_' + menuId);
      // verify if it is already active
      if (menu) {
        if (menu.hasClassName('menu_current')) {
          return;
        };
      } else {
        return;
      }
      // deactivate all
      $$('#header li').invoke('removeClassName', 'menu_current')
      $$('#sidebar .panel').invoke('hide');
      // activate one menu
      menu.className = 'menu_current';
      // show toolbar items
      var panel = $('panel_' + menuId);
      if (panel) {
        panel.show();
      }
    }
  };
}();
