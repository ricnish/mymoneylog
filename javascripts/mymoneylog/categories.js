/**
 * categories.js
 * @author Ricardo Nishimura - 2008
 */
mlog.categories = function(){
  var categories = {};
  return {
    add: function(category){
      //category = category.toLowerCase();
      // if have more than one, split and insert
      category = category.split(mlog.base.categorySeparator);
      for (var i=0;i<category.length;i++) {
        if ((category[i] != '') && (categories[category[i]] === undefined)) {
          categories[category[i]] = true;
        }
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
