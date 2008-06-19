/**
 * categories.js
 * @author Ricardo Nishimura - 2008
 */
mlog.categories = function(){
  var categories = [];
  return {
    add: function(category){
      str = $.trim(category);
      if ((str != '') && ($.inArray(str,categories)<0)) {
        categories.push(str);
        categories.sort();
      }
    },
    getNames: function(){
      return categories.slice(0); // return a clone
    }
  };
}();
