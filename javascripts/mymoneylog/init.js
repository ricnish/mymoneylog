mlog.translate = function(){
  if (Prototype.Browser.IE || Prototype.Browser.Gecko) {
    $$('.msg').each(function(el){
      el.update(mlog.translator.get(el.innerHTML));
    });
  }
  mlog.base.centsChar = mlog.translation.centschar;
  mlog.base.thousandChar = mlog.translation.thousandchar;
}

mlog.init = function(){
  mlog.translate();
  mlog.entriesControl.show();
  Event.observe('menu_entries', 'click', mlog.entriesControl.show);
  Event.observe('menu_overview', 'click', mlog.overviewControl.show);
// to do:
//  Event.observe('menu_chart', 'click', mlog.chartControl.show);
  Event.observe('menu_editor', 'click', mlog.editorControl.show);
  Event.observe('menu_help', 'click', mlog.helpControl.show);
  // disable browser autocomplete
  $$('input.autocompleteoff').each(function(el) {el.setAttribute('autocomplete', 'off');});
}

mlog.onLoadError = function() {
  $('data').innerHTML = mlog.translator.get('datasample');
  mlog.init();
}
