/**
 * translator.js - load and provides the translations
 * @author Ricardo Nishimura - 2008
 */
var mlog = {
  translation: {},
  require: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    // borrowed from scriptaculous
    document.write('<script type="text/javascript" src="'+libraryName+'"><\/script>');
  },
  translator: {
    langId: (navigator.systemLanguage ||
      navigator.userLanguage ||
      navigator.language ||
      navigator.browserLanguage || ''
    ),
    get: function(msg) {
      msg = jQuery.trim(msg.toLowerCase());
      msg = mlog.translation[msg] || msg;
      return msg;
    },
    /* translate all html msg */
    translateDocument: function() {
      $('.msg').each( function(){
          $(this).html(mlog.translator.get($(this).html()));
        }
      );
    }
  }
};

// load default translation
mlog.require('javascripts/jscalendar/lang/calendar-en.js');
mlog.require('javascripts/mymoneylog/lang/en-US.js');

if (!((mlog.translator.langId == 'en-US') || (mlog.translator.langId == 'en'))) {
  // overwrite with translation
  mlog.require('javascripts/jscalendar/lang/calendar-' + mlog.translator.langId.replace(/-.*/,'') + '.js');
  mlog.require('javascripts/mymoneylog/lang/' + mlog.translator.langId + '.js');
}
