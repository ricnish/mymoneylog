/**
 * editor_control.js - data editor controller
 * @author Ricardo Nishimura - 2008
 */
mlog.editorControl = function() {
  var htmlTemplate = null;
  return {
    /* initialize template ... */
    init: function() {
      /* get template... */
      if (!htmlTemplate) {
        htmlTemplate = {
          main: $('#main_editor').html()
        };
        htmlTemplate.main = htmlTemplate.main.replace(/  /gi,'');
        $('#main_editor').html('');
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
              obj.onblur = function() { this.focus(); this.onblur = null; };
          } else {
              // unsupported browsers
          }
        return false;
      }
      return true;
    },
    show: function() {
      mlog.editorControl.init();
      mlog.base.activateMenu('editor');
      $('#report').html(htmlTemplate.main);

      $('#text_data').val(mlog.entries.getAllAsText());
      $('#text_data').height(470); // default height

      $('#text_data').keydown( mlog.editorControl.onKeyPress );
    },
    applyChanges: function() {
      mlog.entries.backup();
      // perform backup
      var srcData = document.getElementById("dataframe").contentWindow.document.getElementById('data');
      srcData.innerHTML = "";
      // sanitize
      var txt = $('#text_data').val();
      srcData.appendChild(document.getElementById("dataframe").contentWindow.document.createTextNode(txt));
      // read fresh data
      mlog.entries.read();
      // perform write
      mlog.entries.save();
      mlog.entriesControl.show();
    }
  }
}();
