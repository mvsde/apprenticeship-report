// ADD WORK ROW
// =============================================================================


;(function() {
  // Cache DOM elements
  const formGroup     = document.querySelector('.form-work__group');
  const formGroupWork = document.querySelector('.form-work__input');

  // Add event listener to + button
  document.getElementById('form-work__button').addEventListener('click', function(event) {
    event.preventDefault();

    // Append a clone of fromGroupWork to formGroup
    formGroup.appendChild(formGroupWork.cloneNode(true));

    // Set focus to the newly created input field
    var nameWork = document.querySelectorAll('[name="work"]');
    nameWork[nameWork.length - 1].focus();
  });
})();
