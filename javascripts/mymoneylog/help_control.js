mlog.helpControl = function() {
  var htmlTemplate = null;
  return {
    /* initialize template ... */
    init: function() {
      /* get template... */
      if (!htmlTemplate) {
        htmlTemplate = {
          main: $('main_help').innerHTML
        };
        htmlTemplate.main = htmlTemplate.main.replace(/  /gi,'');
        $('main_help').innerHTML = '';
      }
    },
    show: function() {
      mlog.helpControl.init();
      mlog.base.activateMenu('help');
      $('report').innerHTML = htmlTemplate.main;
    }
  };

}();
