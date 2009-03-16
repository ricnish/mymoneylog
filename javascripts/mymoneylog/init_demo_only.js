/**
 * init.js - initialize and start myMoneyLog
 * @author Ricardo Nishimura - 2008
 */
mlog.init = function(){
  mlog.translator.translateDocument();
  /* initialize and show entries */
  mlog.entriesControl.show();
  $('#report').show();
  $('#sidebar').show();
  /* initialize menus */
  $('#menu_entries').click(mlog.entriesControl.show);
  $('#menu_categories_overview').click( mlog.categoriesControl.show );
  $('#menu_accounts_overview').click( mlog.accountsControl.show );
  $('#menu_editor').click(mlog.editorControl.show);
  $('#menu_help').click(mlog.helpControl.show);

  // disable browser autocomplete
  $('input.autocompleteoff').attr('autocomplete', 'off');
  // disable submit action for sidebar
  $('#sidebar form').submit( function() {
    return false;
  });

  /* add DataWriter java applet if needed
  if (!$.browser.mozilla && !$.browser.msie) {
    $('#applet').html('<applet name="DataWriter" code="DataWriter.class" archive="applets/DataWriter.jar" width="0" height="0"></applet>');
  }
  //*/
  $('#logo').click( function() {
    open('http://code.google.com/p/mymoneylog/');
  });

  $('#input_date').focus();
}


/* BUILD THE DEMO SAMPLE DATA
 * this section belongs to demo site
 * replace the init.js with this file to get some portuguese data samples
 */
var dataSample = [
[1,-10,'almoco','alimentacao','conta'],
[2,-10,'almoco','alimentacao','conta'],
[3,-10,'almoco','alimentacao','conta'],
[4,-10,'almoco','alimentacao','conta'],
[5,3500,'salario','creditos','conta'],
[5,-10,'almoco','alimentacao','conta'],
[6,-10,'lanche','lazer e turismo','bolso'],
[6,-12,'cinema','lazer e turismo','bolso'],
[6,-120,'loja','vestuario','conta'],
[6,-90,'mercado','mercado','cartao credito'],
[7,-100,'saque','','conta'],
[7,-25,'restaurante','lazer e turismo','bolso'],
[7,-30,'combustivel','carro','cartao credito'],
[7,100,'saque - conta','','bolso'],
[8,-10,'almoco','alimentacao','conta'],
[8,-300,'pagamento cartao','','conta'],
[8,-500,'escola','educacao','conta'],
[8,-800,'aluguel','moradia','conta'],
[8,300,'pagamento cartao - conta','','cartao credito'],
[9,-10,'almoco','alimentacao','conta'],
[10,-10,'almoco','alimentacao','conta'],
[11,-10,'almoco','alimentacao','conta'],
[11,-105,'luz','moradia','conta'],
[12,-10,'almoco','alimentacao','conta'],
[12,-20,'lanchonete','lazer e turismo','bolso'],
[13,-80,'farmacia','saude e beleza','conta'],
[13,-90,'mercado','mercado','cartao credito'],
[14,-30,'combustivel','carro','cartao credito'],
[15,-10,'almoco','alimentacao','conta'],
[16,-10,'almoco','alimentacao','conta'],
[16,-600,'ipva','carro','conta'],
[18,-10,'almoco','alimentacao','conta'],
[19,-10,'almoco','alimentacao','conta'],
[19,-20,'lanchonete','lazer e turismo','bolso'],
[19,-30,'combustivel','carro','cartao credito'],
[20,-90,'mercado','mercado','cartao credito'],
[22,-10,'almoco','alimentacao','conta'],
[23,-10,'almoco','alimentacao','conta'],
[24,-10,'almoco','alimentacao','conta'],
[25,-10,'almoco','alimentacao','conta'],
[26,-10,'almoco','alimentacao','conta'],
[26,-20,'lanchonete','lazer e turismo','bolso'],
[27,-30,'combustivel','carro','cartao credito'],
[27,-90,'mercado','mercado','cartao credito'],
[28,-20,'taxa','banco','conta'],
[28,-500,'transferencia','','conta'],
[28,-90,'telefone','moradia','conta'],
[28,500,'transferencia - conta','','investimento']
];

function getDataSample() {
  var res = ['2007-01-01\t-300\tsaldo inicial\toutros\tcartao credito',
  '2007-01-01\t1000\tsaldo inicial\toutros\tinvestimento',
  '2007-01-01\t200\tsaldo inicial\toutros\tconta',
  '2007-01-01\t50\tsaldo inicial\toutros\tbolso'];
  var initDate = new Date();
  initDate.setDate(1);
  initDate = mlog.base.addMonths(initDate,-2);
  for (var n=0; n<3; n++) {
    var refDate = new Date(initDate);
    refDate.setDate( initDate.getDate()-initDate.getDay() );
    var nextDate;
    for (var i=0; i<dataSample.length; i++) {
      nextDate = new Date(refDate);
      nextDate.setDate(nextDate.getDate()+dataSample[i][0]);
      var row = dataSample[i].slice(0);
      row[0] = mlog.base.dateToString(nextDate);
      res.push(row.join('\t'));
    }
    initDate = mlog.base.addMonths(initDate,1);
  }
  res = res.join('\n');
  return res;
};

// overload some functions and variable for demo
mlog.translation.datasample = getDataSample();
mlog.entries.save = function() {};
mlog.entries.exportFromStartDate = function() {};
mlog.entries.backup = function() {};
