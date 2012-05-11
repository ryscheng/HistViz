chrome.extension.onRequest.addListener(addKeyWords);

function addKeyWords(request, sender, sendResponse) {
  console.log(sender.tab ? 
    "from a content script:" + sender.tab.url :
    "from the extension");
  console.log(request.tags);
}
