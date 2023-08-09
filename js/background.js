"use strict";

// Updated code to support vTiger REST API for vTiger 7.5 community edition

// Set the default WSClient URL
chrome.storage.local.set({ wsClientUrl: 'https://your-vtiger-url.com' });

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
