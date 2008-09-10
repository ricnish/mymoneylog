/**
 * init.js - initialize and start myMoneyLog
 * @author Ricardo Nishimura - 2008
 */
mlog.init = function(){
  mlog.translator.translateDocument();
  /* initialize and show entries */
  mlog.entriesControl.show();
  /* initialize menus */
  $('#menu_entries').click(mlog.entriesControl.show);
  $('#menu_overview').click( mlog.overviewControl.show );
  $('#menu_editor').click(mlog.editorControl.show);
  $('#menu_help').click(mlog.helpControl.show);

  // disable browser autocomplete
  $('input.autocompleteoff').attr('autocomplete', 'off');
  // disable submit action for sidebar
  $('#sidebar form').submit( function() { return false; });

  // add tiddlysaver applet if needed
  if (!$.browser.mozilla && !$.browser.msie) {
    $('#applet').html('<applet name="DataWriter" code="DataWriter.class" archive="applets/DataWriter.jar" width="0" height="0"></applet>');
  }
  $('#logo').click( function() { open('http://code.google.com/p/mymoneylog/'); });

  // init locales selection
  var selLocales = '';
  $.each(mlog.translator.getLocales(), function() {
    selLocales += '<option value="'+ this +'" '+
        (mlog.translator.getLocaleId()==this?'selected="selected"':'')+
        '>'+ this +'</option>';
  })
  $('#select_locales').html(selLocales);
}
