// MAIN JAVASCRIPT FILE
// =============================================================================


;(function() {
  // Cache button elements
  var addButton = document.getElementsByClassName('form-work__button--add');
  var removeButton = document.getElementsByClassName('form-work__button--remove');


  // Set global variables
  var formGroup = [];
  var formInput = [];


  for (var i = 0; i < addButton.length; i++) {
    formGroup[i] = addButton[i].previousElementSibling;
    formInput[i] = document.createElement('div');
    formInput[i].className = 'form-group form-work__input';
    formInput[i].innerHTML = '\
      <label class="form-input form-group__item form-group__item--80">Beschreibung\
        <input type="text" name="task-' + i + '" class="form-input__field">\
      </label>\
      <label class="form-input form-group__item form-group__item--20">Zeit\
        <input type="number" step="0.25" name="hours-' + i + '" class="form-input__field">\
      </label>\
      <button type="button" class="form-work__button form-work__button--remove">-</button>';

    addButton[i].dataset.index = i;
  }


  var removeButtonEventListener = function() {
    for (var i = 0; i < removeButton.length; i++) {
      removeButton[i].addEventListener('click', function(event) {
        event.preventDefault();

        // Remove parentNode
        this.parentNode.remove();
      });
    }
  };
  removeButtonEventListener();


  for (var i = 0; i < addButton.length; i++) {
    addButton[i].addEventListener('click', function(event) {
      event.preventDefault();

      // Append a clone of fromGroupWork to formGroup
      formGroup[this.dataset.index].appendChild(formInput[this.dataset.index].cloneNode(true));

      var nameWork = document.querySelectorAll('[name="task-' + this.dataset.index + '"]');
      nameWork[nameWork.length - 1].focus();

      removeButtonEventListener();
    });
  }
})();
