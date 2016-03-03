// ADD WORK ROW
// =============================================================================


;(function() {
  // Cache DOM elements
  const formGroup     = document.querySelector('.form-work');
  const formGroupWork = document.querySelector('.form-work__input-group');

  // Add event listener to + button
  document.getElementById('form-work__button').addEventListener('click', function(event) {
    event.preventDefault();

    // Append a clone of fromGroupWork to formGroup
    formGroup.appendChild(formGroupWork.cloneNode(true));
  });
})();
