/**
 * @author ricardo
 */
var mlog = mlog || {};
mlog.translation = {};
mlog.translator = {
  langId: (navigator.systemLanguage ||
    navigator.userLanguage ||
    navigator.language ||
    navigator.browserLanguage || ''
  ),
  get: function(msg) {
    msg = msg.toLowerCase().strip();
    msg = mlog.translation[msg] || msg;
    return msg;
  }
};
// load default translation
Scriptaculous.require('javascripts/jscalendar/lang/calendar-en.js');
Scriptaculous.require('javascripts/mymoneylog/lang/en-US.js');

if (!((mlog.translator.langId == 'en-US') || (mlog.translator.langId == 'en'))) {
  // load overwrite with translation
  //alert(mlog.translator.langId);
  Scriptaculous.require('javascripts/jscalendar/lang/calendar-' + mlog.translator.langId.replace(/-.*/,'') + '.js');
  Scriptaculous.require('javascripts/mymoneylog/lang/' + mlog.translator.langId + '.js');
}
