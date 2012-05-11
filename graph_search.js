chrome.extension.onRequest.addListener(addKeyWords);
var searchQuery = "";

function addKeyWords(request, sender, sendResponse) {
  searchQuery = searchQuery + " " + request.tags;
  console.log("Got new keywords: " + request);
  console.log("Searching for "+searchQuery);
  chrome.history.search({text: searchQuery, maxResults: 10}, function(results) {
    console.log("Results" + results);
    for (var i=0; i<results.length; i++) {
      console.log(results[i]);
    }
  });
}

