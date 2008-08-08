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
          accounts[account] = value;
          accounts[account][0] = 1;
        } else {
          accounts[account] += value;
          accounts[account][0]++;
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
      for (var account in accounts) {
        ret.push([account,accounts[account],accounts[account][0]]);
      }
      return ret;
    },
    reset: function() {
      accounts = {};
    },
    remove: function(account,amount) {
      if (account!="") {
        var value = amount || 0;
        if (accounts[account] === undefined) {
          accounts[account] = value*-1;
          accounts[account][0] = 1;
        } else {
          accounts[account] -= value;
          if (accounts[account][0]>0) accounts[account][0]--;
        }
      }
    }
  };
};

mlog.accounts = mlog.accountsClass();
