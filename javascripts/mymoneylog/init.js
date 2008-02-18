/* translate html msg */
mlog.translate = function(){
  $$('.msg').each( function(el){
      el.update(mlog.translator.get(el.innerHTML));
    }
  );
}
/* init after data load */
mlog.init = function(){
  mlog.translate();
  /* initialize and show entries */
  mlog.entriesControl.show();
  /* initialize menus */
  Event.observe('menu_entries', 'click', mlog.entriesControl.show);
  Event.observe('menu_overview', 'click', mlog.overviewControl.show);
// to do:
//  Event.observe('menu_chart', 'click', mlog.chartControl.show);
  Event.observe('menu_editor', 'click', mlog.editorControl.show);
  Event.observe('menu_help', 'click', mlog.helpControl.show);
  // disable browser autocomplete
  $$('input.autocompleteoff').each(function(el) {el.setAttribute('autocomplete', 'off');});
  // disable submit action for sidebar
  $A($('sidebar').getElementsByTagName('form')).each(
    function(el) { el.observe('submit', function(e){
      Event.stop(e);
      })
    }
  );
  // add tiddlysaver applet if needed
  if (!Prototype.Browser.Gecko && !Prototype.Browser.IE) {
    $('applet').innerHTML = '<applet name="TiddlySaver" code="TiddlySaver.class" archive="applets/TiddlySaver.jar" width="0" height="0"></applet>';
  }
}
/* if data.html is not available init default data */
mlog.onLoadError = function() {
  $('data').innerHTML = mlog.translator.get('datasample');
  mlog.init();
}
