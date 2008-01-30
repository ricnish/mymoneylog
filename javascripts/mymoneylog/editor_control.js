mlog.editorControl = function() {
  var htmlTemplate = null;
  return {
    /* initialize template ... */
    init: function() {
      /* get template... */
      if (!htmlTemplate) {
        htmlTemplate = {
          main: $('main_editor').innerHTML
        };
        htmlTemplate.main = htmlTemplate.main.replace(/  /gi,'');
        $('main_editor').innerHTML = '';
      }
    },
    onKeyPress: function(event) {
      /* handle tab key to insert it on textarea
      * original from: http://l4x.org/261/
      */
      if (event.keyCode == Event.KEY_TAB) {
          var obj = $('text_data');
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
        Event.stop(event);
        return false;
      }
      return true;
    },
    show: function() {
      mlog.editorControl.init();
      mlog.base.activateMenu('editor');
      $('report').innerHTML = htmlTemplate.main;

      $('text_data').value = mlog.entries.getAllAsText();
      $('text_data').rows = 35; // default height

      Event.observe($('text_data'), (Prototype.Browser.IE)?'keydown':'keypress', mlog.editorControl.onKeyPress);
    },
    applyChanges: function() {
      mlog.entries.backup();
      // perform backup
      var srcData = $("dataframe").contentWindow.document.getElementById('data');
      srcData.innerHTML = "";
      // sanitize
      var txt = ($('text_data').value).stripTags();
      srcData.appendChild($("dataframe").contentWindow.document.createTextNode(txt));
      // read fresh data
      mlog.entries.read();
      // perform write
      mlog.entries.save();
      mlog.entriesControl.show();
    }
  }
}();

  /*

   // reinsert without blank lines

   // ie parses the text before insert, so use appendChild to avoid it

   srcData.innerHTML = "";

   srcData.appendChild($("dataframe").contentWindow.document.createTextNode($('text_data').value));

   */
