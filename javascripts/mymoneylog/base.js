/**
 * base.js - provides some base functions
 * @author Ricardo Nishimura - 2008
 */
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
      filePath = decodeURI(filePath);
      if (jQuery.browser.mozilla)
        return mozillaSaveFile(filePath, content);
      if (jQuery.browser.msie)
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
    /* format float as localized currency string*/
    floatToString: function(num) {
      num = num.toFixed(2).replace('.', mlog.translation.centschar);
      while (num.search(/[0-9]{4}/) > -1) {
        num = num.replace(/([0-9])([0-9]{3})([^0-9])/, '$1' + (mlog.translation.thousandchar||',') + '$2$3');
      }
      return num;
    },
    /* format float and stylize to currency */
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
    /* activate a menu tab and its sidebar panel*/
    activateMenu: function(menuId){
      var menu = $('#menu_' + menuId);
      // verify if it is already active
      if (!menu || menu.hasClass('menu_current')) {
          return;
      };
      // deactivate all
      $('#header li').removeClass('menu_current')
      $('#sidebar .panel').hide();
      // activate one menu
      menu.addClass('menu_current');
      // show toolbar items
      $('#panel_' + menuId).show();
    },
    stripTags: function(str) {
        return str.replace(/<\/?[^>]+>/gi, '');
    }
  };
}();

