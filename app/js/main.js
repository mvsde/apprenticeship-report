// ADD WORK ROW
// =============================================================================


;(function() {
  // Cache button elements
  var formButton = document.getElementsByClassName('form-work__button');

  // Set global variables
  var formGroup = [];
  var formInput = [];

  for (var i = 0; i < formButton.length; i++) {
    formGroup[i] = formButton[i].previousElementSibling;
    formInput[i] = document.createElement('div');
    formInput[i].className = 'form-group form-work__input';
    formInput[i].innerHTML = '\
      <label class="form-input form-group__item form-group__item--80">Beschreibung\
        <input type="text" name="work-' + i + '" class="form-input__field">\
      </label>\
      <label class="form-input form-group__item form-group__item--20">Zeit\
        <input type="number" step="0.25" name="time-' + i + '" class="form-input__field">\
      </label>';

    formButton[i].dataset.index = i;
  }

  for (var i = 0; i < formButton.length; i++) {
    formButton[i].addEventListener('click', function(event) {
      event.preventDefault();

      // Append a clone of fromGroupWork to formGroup
      formGroup[this.dataset.index].appendChild(formInput[this.dataset.index].cloneNode(true));

      var nameWork = document.querySelectorAll('[name="work-' + this.dataset.index + '"]');
      nameWork[nameWork.length - 1].focus();
    });
  }
})();
