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

// load overwrite with translation
Scriptaculous.require('javascripts/jscalendar/lang/calendar-' + mlog.translator.langId.replace(/-.*/,'') + '.js');
Scriptaculous.require('javascripts/mymoneylog/lang/' + mlog.translator.langId + '.js');
