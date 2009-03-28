/**
 * categories.js
 * @author Ricardo Nishimura - 2008
 */
mlog.categories = function(){
  var _categories = {};
  return {
    add: function(category){
      if (category != '') {
        if (_categories[category] === undefined) _categories[category] = 1;
        else _categories[category]++; // count it
      }
    },
    getNames: function(){
      var catDescr = [];
      for (var cat in _categories) {
        catDescr.push(cat);
      }
      return catDescr.sort();
    },
    getAll: function() {
      var ret = [];
      var catList = this.getNames();
      for (var i=0;i<catList.length;i++) {
        ret.push([catList[i], _categories[catList[i]]]);
      }
      return ret;
    },
    reset: function() {
      _categories = {};
    },
    remove: function(category){
      if (category != '') {
        if (_categories[category] > 0) _categories[category]--;
      }
    }
  };
}();