const convertDate = require('./convertDate.js');

module.exports = {
  // Return monday of week 'date'
  monday: function(date) {
    var date = new Date(date);
    var day = date.getDay() || 7;

    if (day !== 1) {
      date.setHours(-24 * (day - 1));
    }

    return convertDate.machine(date);
  },

  // Return friday of week 'date'
  friday: function(date) {
    var date = new Date(date);
    var day = date.getDay() || 7;

    if (day !== 5) {
      date.setHours(-24 * (day - 1) + 24 * 4);
    }

    return convertDate.machine(date);
  },

  // Return this week's monday/friday
  currentWeek: function() {
    return {
      monday: this.monday(new Date()),
      friday: this.friday(new Date())
    }
  }
};
