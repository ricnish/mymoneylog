/**
 * help_control.js - display the help
 * @author Ricardo Nishimura - 2008
 */
mlog.helpControl = function() {
  var _htmlTemplate = null;
  return {
    /* initialize template ... */
    init: function() {
      /* get template... */
      if (!_htmlTemplate) {
        _htmlTemplate = {
          main: $('#main_help').html()
        };
        _htmlTemplate.main = _htmlTemplate.main.replace(/  /gi,'');
        $('#main_help').html('');
      }
    },
    show: function() {
      mlog.helpControl.init();
      mlog.base.activateMenu('help');
      $('#report').html(_htmlTemplate.main);
    }
  };
}();