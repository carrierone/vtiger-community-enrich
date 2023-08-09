import WSClient from '../lib/WSClient';

// Get the WSClient URL from the Chrome settings
const wsClientUrl = chrome.extension.getBackgroundPage().wsClientUrl;
const vtigerClient = new WSClient(wsClientUrl);

// ... rest of the code ...
