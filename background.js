// this background page is just to get access to the "tab create" function so that we can create a new tab with our viz (at least for now--we may eventually want to override the actual "history" functionality or something eventually)
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({url:chrome.extension.getURL("graph_test.html")});
});
