function loadFile(event) {
  var reader = new FileReader();

  function processFile(event) {
    var fileContent = JSON.parse(event.target.result);
    console.log(fileContent);
  }

  reader.onload = processFile;
  reader.readAsText(event.target.files[0]);
}

document.getElementById('file-config').addEventListener('change', loadFile, false);
document.getElementById('file-database').addEventListener('change', loadFile, false);
