/**
 * help_control.js - display the help
 * @author Ricardo Nishimura - 2008
 */
mlog.helpControl = function() {
  var htmlTemplate = null;
  return {
    /* initialize template ... */
    init: function() {
      /* get template... */
      if (!htmlTemplate) {
        htmlTemplate = {
          main: $('#main_help').html()
        };
        htmlTemplate.main = htmlTemplate.main.replace(/  /gi,'');
        $('#main_help').html('');
      }
    },
    show: function() {
      mlog.helpControl.init();
      mlog.base.activateMenu('help');
      $('#report').html(htmlTemplate.main);
    }
  };
}();
