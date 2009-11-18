/**
 * accounts.js
 * @author Ricardo Nishimura - 2008
 */
mlog.accountsClass = function(){
  var _accounts = {};
  return {
    add: function(account,amount){
      if (account!="") {
        var value = amount || 0;
        if (_accounts[account] === undefined) {
          _accounts[account] = {
            'value': value,
            'qtd': 1
          };
        } else {
          _accounts[account].value += value;
          _accounts[account].qtd ++;
        }
      }
    },
    getNames: function(){
      var accountsDescr = [];
      for (var account in _accounts) {
        accountsDescr.push(account);
      }
      return accountsDescr.sort();
    },
    getAll: function() {
      var ret = [];
      for (var account in _accounts) {
        ret.push([account,_accounts[account].value,_accounts[account].qtd]);
      }
      return ret;
    },
    getAllwithTotal: function() {
      var ret = [];
      var sum = 0;
      var maxValue = 0;
      var tmpVal = 0;
      for (var account in _accounts) {
        ret.push([account,_accounts[account].value,_accounts[account].qtd]);
        tmpVal = _accounts[account].value;
        sum += tmpVal;
        tmpVal = Math.abs(tmpVal);
        maxValue = tmpVal > maxValue ? tmpVal : maxValue;
      }
      ret.sort();
      ret.push([mlog.translator.msg('total'),sum,0]);
      return { 'accounts': ret, 'max_value': maxValue};
    },
    reset: function() {
      _accounts = {};
    },
    remove: function(account,amount) {
      if (account!="") {
        var value = amount || 0;
        if (_accounts[account] === undefined) {
          _accounts[account]  = {
            'value': value*-1,
            'qtd': 1
          };
        } else {
          _accounts[account].value -= value;
          if (_accounts[account].qtd>0) _accounts[account].qtd--;
        }
      }
    }
  };
};

mlog.accounts = mlog.accountsClass();
