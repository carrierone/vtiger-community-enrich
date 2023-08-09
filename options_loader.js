// Load options.html when the extension's icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("options.html")
  });
});
