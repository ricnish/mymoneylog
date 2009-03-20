/**
 * editor_control.js - data editor controller
 * @author Ricardo Nishimura - 2008
 */
mlog.editorControl = function() {
  var _htmlTemplate = null;
  return {
    /* initialize template ... */
    init: function() {
      /* get template... */
      if (!_htmlTemplate) {
        _htmlTemplate = {
          main: $('#main_editor').html()
        };
        _htmlTemplate.main = _htmlTemplate.main.replace(/  /gi,'');
        $('#main_editor').html('');
        /* initialize datepicker */
        $('#input_export_from_date').val(mlog.base.getCurrentDate());
      }
    },
    onKeyPress: function(event) {
      /* handle tab key to insert it on textarea
      * original from: http://l4x.org/261/
      * tab key code = 9
      */
      if (event.which  == 9) {
        var obj = document.getElementById('text_data');
        if (obj.setSelectionRange) {
          var pos = obj.scrollTop;
          // mozilla
          var s = obj.selectionStart;
          var e = obj.selectionEnd;
          obj.value = obj.value.substring(0, s) +
          "\t" + obj.value.substr(e);
          obj.setSelectionRange(s + 1, s + 1);
          obj.focus();
          obj.scrollTop = pos; // avoid scroll top
        } else if (obj.createTextRange) {
          // ie
          document.selection.createRange().text="\t"
          obj.onblur = function() {
            this.focus(); this.onblur = null;
          };
        } else {
        // unsupported browsers
        }
        return false;
      }
      return true;
    },
    show: function() {
      // opera doesn't return correct height, put fixed
      var tHeight = $.browser.opera?430: ($(window).height()-160);
      mlog.editorControl.init();
      mlog.base.activateMenu('editor');
      $('#report').html(_htmlTemplate.main);
      $('#text_data').height(tHeight).val(mlog.entries.toString()).keydown( mlog.editorControl.onKeyPress );
    },
    applyChanges: function() {
      // if data.html doesn't exists, create and load it
      if (!$("#dataframe").attr('src')) {
        mlog.entries.save();
        $("#dataframe").load( function() {
          mlog.editorControl.applyChanges();
        }).attr('src', mlog.base.dataFileName);
        return;
      }
      $("#dataframe").unbind('load');

      // to do: sanitize
      var txt = $('#text_data').val();
      // perform backup
      mlog.entries.backup();
      var srcData = document.getElementById('dataframe').contentWindow.document.getElementById('data');
      srcData.innerHTML = "";
      srcData.appendChild(document.getElementById("dataframe").contentWindow.document.createTextNode(txt));
      // read fresh data
      mlog.entries.read();
      // perform write
      mlog.entries.save();
      mlog.entriesControl.show();
    },
    exportFromDate: function() {
      mlog.entries.exportFromStartDate($('#input_export_from_date').val());
    }
  }
}();
