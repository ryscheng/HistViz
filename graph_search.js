chrome.extension.onRequest.addListener(addKeyWords);
var searchQuery = [];
var finishedQueries = 0;
var searchResults = new Object();

function addKeyWords(request, sender, sendResponse) {
  console.log("Got new keywords: " + request.tags);
  var tags = request.tags.split(" ");
  for (var i=0; i<tags.length; i++) {
    searchQuery.push(tags[i]);
    console.log("Searching for "+tags[i]);
    chrome.history.search({text: tags[i], maxResults: 10}, function(results) {
      finishedQueries = finishedQueries + 1;
      for (var i=0; i< results.length; i++) {
        var item = results[i];
        if (!searchResults.hasOwnProperty(item.url)) {
          searchResults[item.url] = [];
        }
        searchResults[item.url].push(item);
      }
      if (finishedQueries >= searchQuery.length) {
        console.log(searchResults);
        rayPrint(searchResults);
      }
    });
  }
}

