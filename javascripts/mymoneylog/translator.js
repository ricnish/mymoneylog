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

    msg: function(msg) {
      msg = $.trim(msg.toLowerCase());
      msg = mlog.translation[msg] || msg;
      return msg;
    },
    /* translate all html msg */
    translateDocument: function() {
      // init locales selection
      var selLocales = '';
      $.each(mlog.translator.getLocales(), function() {
        selLocales += '<option value="'+ this +'" '+
        (mlog.translator.getLocaleId()==this?'selected="selected"':'')+
        '>'+ this +'</option>';
      })
      $('#select_locales').html(selLocales);
      
      $('.msg').each( function(){
        $(this).html(mlog.translator.msg($(this).html()));
      }
      );
    },
    /* return the available locales */
    getLocales: function() {
      return ['en-us','pt-br'];
    }
  }
}();