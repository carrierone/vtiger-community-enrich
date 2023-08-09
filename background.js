// Background script

// Get the WSClient URL from Chrome settings
chrome.storage.sync.get(['wsClientUrl'], function(result) {
  const wsClientUrl = result.wsClientUrl || 'https://your-vtiger-url.com';

  // Set the default WSClient URL
  chrome.storage.sync.set({ wsClientUrl });

  // Register the Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.error('Service Worker registration failed:', error);
        });
    });
  }

  // ... rest of the code ...
});
