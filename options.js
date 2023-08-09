document.addEventListener('DOMContentLoaded', function() {
  var saveButton = document.getElementById('saveButton');
  var wsClientUrlInput = document.getElementById('wsClientUrl');

  // Load the WSClient URL from Chrome storage
  chrome.storage.sync.get('wsClientUrl', function(data) {
    wsClientUrlInput.value = data.wsClientUrl;
  });

  // Save the WSClient URL to Chrome storage
  saveButton.addEventListener('click', function() {
    var wsClientUrl = wsClientUrlInput.value;
    chrome.storage.sync.set({ wsClientUrl: wsClientUrl }, function() {
      alert('WSClient URL saved successfully!');
    });
  });
});
