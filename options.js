document.addEventListener('DOMContentLoaded', function() {
  var saveButton = document.getElementById('saveButton');
  var wsClientUrlInput = document.getElementById('wsClientUrl');

  // Load the saved WSClient URL
  chrome.storage.sync.get(['wsClientUrl'], function(result) {
    wsClientUrlInput.value = result.wsClientUrl || '';
  });

  // Save the WSClient URL
  saveButton.addEventListener('click', function() {
    var wsClientUrl = wsClientUrlInput.value;
    chrome.storage.sync.set({ wsClientUrl }, function() {
      alert('WSClient URL saved successfully!');
    });
  });
});
