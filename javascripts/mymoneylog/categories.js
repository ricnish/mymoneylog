/**
 * categories.js
 * @author Ricardo Nishimura - 2008
 */
mlog.categories = function(){
  var categories = {};
  return {
    add: function(category){
      category = category.toLowerCase();
      if (categories[category] === undefined) {
        categories[category] = true;
      }
    },
    getNames: function(){
      var catDescr = [];
      for (var cat in categories) {
        catDescr.push(cat);
      }
      return catDescr.sort();
    }
  };
}();
