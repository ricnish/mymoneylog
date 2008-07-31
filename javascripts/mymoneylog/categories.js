/**
 * categories.js
 * @author Ricardo Nishimura - 2008
 */
mlog.categories = function(){
  var categories = [];
  return {
    add: function(category){
<<<<<<< .mine
      if (category != '') {
        if (categories[category] === undefined) categories[category] = 1;
        else categories[category]++; // count it
=======
      str = $.trim(category);
      if ((str != '') && ($.inArray(str,categories)<0)) {
        categories.push(str);
        categories.sort();
>>>>>>> .r101
      }
    },
    getNames: function(){
      return categories.slice(0); // return a clone
    },
    getAll: function() {
      var ret = [];
      var catList = this.getNames();
      for (var i=0;i<catList.length;i++) {
        ret.push([catList[i], categories[catList[i]]]);
      }
      return ret;
    },
    reset: function() {
      categories = {};
    },
    remove: function(category){
      if (category != '') {
        if (categories[category] > 0) categories[category]--;
      }
    }
  };
}();
