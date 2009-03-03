/**
 * base.js - provides some base functions
 * @author Ricardo Nishimura - 2008
 */
var mlog = mlog || {};
mlog.translation = mlog.translation || {};

mlog.base = function() {
  // private:
  // Returns null if it can't do it, false if there's an error, true if it saved OK
  var ieSaveFile = function(filePath,content) {
    try {
     var fso = new ActiveXObject("Scripting.FileSystemObject");
      var file = fso.OpenTextFile(filePath,2,true,-1);
      file.Write(content);
      file.Close();
      fso = null;
      return true;
    } catch(e) {
      return null;
    }
    return false;
  };
  // Returns null if it can't do it, false if there's an error, true if it saved OK
  var mozillaSaveFile = function(filePath,content) {
    if(window.Components) {
      try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filePath);
        if(!file.exists()) { file.create(0,0664); }
        var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        fos.init(file,0x20|0x02,00004,null);
        os.init(fos, 'UTF-8', 0, 0x0000);
        os.writeString(content);
        os.close();
        fos.close();
        os = null;
        fos = null;
        return true;
      } catch(e) {
        return false;
      }
    }
    return null;
  };
  var javaSaveFile = function(filePath,content) {
    try {
      if(document.applets["DataWriter"]) {
        var res = document.applets["DataWriter"].saveFile(filePath,"UTF-8",content);
        if (res>0) { return true; }
      }
    } catch(e) {}
    try {
      var s = new java.io.PrintStream(new java.io.FileOutputStream(filePath));
      s.print(content);
      s.close();
    } catch(er) {
      return null;
    }
    return true;
  };

  // public:
  return {
    /* begin config parameters */
    dataFieldSeparator: '\t',
    dataRecordSeparator: /[\n\r]+/,
    categorySeparator: '; ',
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
      content = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" " +
        "\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">" +
        "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\" xml:lang=\"en\">" +
        "<head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" +
        "<title>myMoneyLog Data File</title></head><body><pre id=\"data\">\n" +
        content +
        "</pre></body></html>";
      if ($.browser.mozilla) {
        return mozillaSaveFile(filePath, content);
      }
      else if ($.browser.msie) {
        return ieSaveFile(filePath, content);
      }
      return javaSaveFile(filePath, content);
    },
    // sort array by an index
    arraySort: function(theArray, colIndex){
      var i = colIndex || 0;
      /* sort one index */
      var sortOne = function(va, vb, vi){
        var a = va[vi];
        var b = vb[vi];
        try {
          if (typeof a == 'string') {
            a = a.toLowerCase();
            b = b.toLowerCase();
          }
          if (a < b) {
            return -1;
          } else
            if (a > b) {
              return 1;
            }
        } catch(er) {}
        return 0;
      };
      /* sort two index: if first is equal, try next index */
      var sortTwo = function(va,vb) {
        var res = sortOne(va,vb,i);
        if  ((res===0) && (va.length>i+1)) {
          return sortOne(va,vb,i+1);
        }
        return res;
      };
      theArray.sort(sortTwo);
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
      var res = new Date(dt);
      res.setHours(1); // avoid daylight saving calc
      res.setMonth(dt.getMonth() + nMonth);
      if (res.getDate()<dt.getDate()) {
        res.setDate(1);
        res.setDate(res.getDate() - 1);
      }
      return res;
    },
    /* parse 'YYYY-mm-dd' to date */
    stringToDate: function(str) {
      return new Date(str.replace(/-/g,'/'));
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
      if (!menu || menu.hasClass('menu_current')) { return; }
      // deactivate all
      $('#header li').removeClass('menu_current');
      $('#sidebar .panel').hide();
      // activate one menu
      menu.addClass('menu_current');
      // show toolbar items
      $('#panel_' + menuId).show();
    },
    stripTags: function(str) {
        return str.replace(/<\/?[^>]+>/gi, '');
    },
    setCookie: function(c_name,value,expiredays) {
      var exdate = new Date();
      exdate.setDate(exdate.getDate()+(expiredays||60));
      document.cookie = c_name+"="+escape(value)+";expires="+exdate.toGMTString();
    },
    getCookie: function(c_name) {
      if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
          c_start = c_start + c_name.length+1;
          var c_end = document.cookie.indexOf(";", c_start);
          if (c_end == -1) { c_end = document.cookie.length; }
          return unescape(document.cookie.substring(c_start, c_end));
        }
      }
      return "";
    },
    require: function(libraryName) {
      // inserting via DOM fails in Safari 2.0, so brute force approach
      // borrowed from scriptaculous
      document.write('<script type="text/javascript" src="'+libraryName+'"><\/script>');
    },
    setLocale: function() {
      var newLocale = $('#select_locales option:selected').attr('value');
      if (mlog.translator.getLocaleId() != newLocale) {
        // set new locale in a cookie for 3 years
        this.setCookie('localeId',newLocale,360*3);
        // fade out and reload page
        $('body').fadeOut('normal', function() {
          window.location.href=window.location.href;
          });
      }
    },
    /* format array as tag cloud string
     * @param: array arrayTags - where index 0 is the tag name
     * @param: int indexCount - index of tag name's count, default: 1
    */
    arrayToTagCloud: function(arrayTags,indexCount) {
      var indexQtd = indexCount || 1;
      var cList = arrayTags;
      var minCount = 999999;
      var maxCount = 0;
      var minSize = 9; // min font size in pixel
      var maxSize = 29; // max font size in pixel
      var fontSize = minSize;
      cList.sort();
      /* iterate to get min and max */
      $.each(cList, function(i,v) {
        if (v[indexQtd]>maxCount) { maxCount = v[indexQtd]; }
        if (v[indexQtd]<minCount) { minCount = v[indexQtd]; }
      });
      var list = '';
      for (var i=0;i<cList.length;i++) {
        if (maxCount>2) {
          fontSize = (((cList[i][indexQtd]-minCount)*(maxSize-minSize))/(maxCount-minCount)) + minSize;
        }
        else {
          fontSize = minSize;
        }
        list += '<span class="tagCloud" style="font-size: '+fontSize+
          'px" onclick="mlog.base.toggleTag(this)">'+cList[i][0]+'</span> ';
      }
      return list;
    },
    toggleTag: function(elem) {
      $(elem).toggleClass('tagSelect');
    },
    toggleAllTagCloud: function(el) {
      var elem = $(el);
      mlog.base.toggleTag(elem);
      var chk = elem.hasClass("tagSelect");
      $.each(elem.next().children(), function(i,v) {
        $(v).removeClass("tagSelect");
        if (chk) $(v).addClass("tagSelect");
      });
    },
    showTooltip: function(x, y, contents) {
      $('<div id="tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y + 5,
        left: x + 5,
        border: '1px solid #ff0',
        padding: '2px',
        'background-color': '#ffa',
        opacity: 0.90
      }).appendTo("body").fadeIn(200);
    },
    removeTooltip: function() {
      $('#tooltip').remove();
    },
    drawChart: function(container,dataset, xlabels) {
      // draw
      $.plot($(container),
        dataset,
        {
          xaxis: {ticks: xlabels},
          legend: {margin:10, noColumns:2, backgroundOpacity:0.4},
          colors: ["#edc240","#afd8f8","#cb4b4b","#4da74d","#9440ed",'#808080',
          '#808000','#008080','#0000FF','#00FF00','#800080','#FF00FF',
          '#800000','#FF0000','#FFFF00','#FF8C0','#FFA07A','#D2691E',
          '#DDA0DD','#ADFF2F','#4B0082','#FFFFA0','#00FF7F','#BDB76B',
          '#B0C4DE','#00FFFF','#008000','#000080','#C0C0C0'],
          grid: {
            tickColor: '#fff',
            backgroundColor: { colors: ["#D5E8F9",'#FFF']},
            borderColor: '#fff',
            hoverable: true
          },
          points: { show: false },
          lines: { show: true }
        }
      );
      // attach tooltip
      $(container).bind("plothover", function (event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));
        if (item) {
          mlog.base.removeTooltip();
          var x = item.datapoint[0].toFixed(2),
              y = item.datapoint[1].toFixed(2);

          mlog.base.showTooltip(item.pageX, item.pageY,
                      item.series.label + "<br />" + y);
        }
        else {
          mlog.base.removeTooltip();
        }
      });
    }
  };
}();
