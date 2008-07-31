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
        } else {
          accounts[account] += value;
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
        ret.push([account,accounts[account]]);
      }
      return ret;
    },
    reset: function() {
      accounts = {};
    },
    remove: function(account,amount) {
      this.add(account,amount*-1);
    }
  };
};

mlog.accounts = mlog.accountsClass();
