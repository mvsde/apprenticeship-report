module.exports = {
  // Add zeros to single digit months and days
  addLeadingZeros: function(date) {
    var date = new Date(date);
    var yyyy = date.getFullYear();
    var mm   = date.getMonth() + 1; //January is 0
    var dd   = date.getDate();

    // Add leading zero to month
    if (mm < 10) {
        mm = '0' + mm
    }

    // Add leading zero to day
    if (dd < 10) {
        dd = '0' + dd;
    }

    return [yyyy, mm, dd];
  },

  // Output yyyy-mm-dd
  machine: function(date) {
    var dateArray = this.addLeadingZeros(date);

    return dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2];
  },

  // Output dd.mm.yyyy
  human: function(date) {
    var dateArray = this.addLeadingZeros(date);

    return dateArray[2] + '.' + dateArray[1] + '.' + dateArray[0];
  }
};
