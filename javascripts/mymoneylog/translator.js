/**
 * translator.js - load and provides the translations
 * @author Ricardo Nishimura - 2008
 */
mlog.translator = function() {
  var localeId = mlog.base.getCookie('localeId') ||
        (navigator.systemLanguage ||
        navigator.language ||
        navigator.browserLanguage || 'en-us'
      );
  localeId = localeId.toLowerCase();

  // load default locale
  mlog.base.require('javascripts/translation/en-us.js');

  if ((localeId != 'en-us') && (localeId != 'en')) {
    // overwrite with translation
    mlog.base.require('javascripts/translation/' + localeId + '.js');
  }

  return {
    getLocaleId: function() {
      return localeId;
    },

    get: function(msg) {
      msg = $.trim(msg.toLowerCase());
      msg = mlog.translation[msg] || msg;
      return msg;
    },
    /* translate all html msg */
    translateDocument: function() {
      $('.msg').each( function(){
          $(this).html(mlog.translator.get($(this).html()));
        }
      );
    },
    /* return the available locales */
    getLocales: function() {
      return ['en-us','pt-br'];
    }
  }
}();
