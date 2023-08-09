"use strict";

// Updated code to support vTiger REST API for vTiger 7.5 community edition

// Import the WSClient module
import WSClient from './lib/WSClient';

// Get the WSClient URL from the Chrome settings
const wsClientUrl = chrome.extension.getBackgroundPage().wsClientUrl;
const vtigerClient = new WSClient(wsClientUrl);

// ... your code using the vtigerClient goes here ...
