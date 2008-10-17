/**
 * accounts.js
 * @author Ricardo Nishimura - 2008
 */
mlog.accountsClass = function(){
  var accounts = {};
  return {
    add: function(account,amount){
      if (account!="") {
        var value = amount || 0;
        if (accounts[account] === undefined) {
          accounts[account] = { 'value': value, 'qtd': 1 };
        } else {
          accounts[account].value += value;
          accounts[account].qtd ++;
        }
      }
    },
    getNames: function(){
      var accountsDescr = [];
      for (var account in accounts) {
        accountsDescr.push(account);
      }
      return accountsDescr.sort();
    },
    getAll: function() {
      var ret = [];
      var sum = 0;
      for (var account in accounts) {
        ret.push([account,accounts[account].value,accounts[account].qtd]);
        sum += accounts[account].value;
      }
      ret.push([mlog.translator.get('total'),sum,0]);
      return ret;
    },
    reset: function() {
      accounts = {};
    },
    remove: function(account,amount) {
      if (account!="") {
        var value = amount || 0;
        if (accounts[account] === undefined) {
          accounts[account]  = { 'value': value*-1, 'qtd': 1 };
        } else {
          accounts[account].value -= value;
          if (accounts[account].qtd>0) accounts[account].qtd--;
        }
      }
    }
  };
};

mlog.accounts = mlog.accountsClass();
