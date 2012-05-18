//chrome.extension.onRequest.addListener(addKeyWords);
//chrome.extension.onRequest.addListener(initialKeywords);
chrome.extension.onRequest.addListener(handleRequests);

MAX_SEARCH_RESULTS=4;
NUM_TAGS=7;
MAX_DRAW_RESULTS=10;
var rootUrl = "";
var rootTitle = ""; 
var searchQuery = [];
var finishedQueries = 0;
var searchResults = new Object();

var availableTags = {};
var navigationStack = [];

function handleRequests(request, sender, sendResponse) {
	if (request.receiver == "rootScreenshot") {
		receiveRootScreenshot(request.screenshot);
	} else if (request.receiver == "initialKeywords") {
		initialKeywords(request, sender, sendResponse);
	}
}

function initialKeywords(request, sender, sendResponse) {
	console.log("Got new keywords: " + request);

	if (request.root) {
		var root = { id: 'root', title: request.title, url: request.url, screenshot: request.screenshot };
		var tags = request.tags.split(" ");
		for (var i=0; i<tags.length; i++) {
			// choose the first tags that come (ranking them might be preferable)
			availableTags[tags[i].toLowerCase()] = (i<NUM_TAGS)?true:false;
		}
		receiveRoot(root); //notify graph_test that it can start loading tags
	}
}

function addKeyWords(request, sender, sendResponse) {
  console.log("Got new keywords: " + request);
  if (request.root) {
    rootUrl = request.url;
    rootTitle = request.title;
	rootScreenshot = request.screenshot;
  }
  screenshotURL = request.screenshot;
  var tags = request.tags.split(" ");
  for (var i=0; i<tags.length; i++) {
    searchQuery.push(tags[i]);
    console.log("Searching for "+tags[i]);
    chrome.history.search({text: tags[i], startTime: 0, maxResults: MAX_SEARCH_RESULTS}, function(results) {
	  finishedQueries = finishedQueries + 1;
      for (var i=0; i< results.length; i++) {
        var item = results[i];
        if (!searchResults.hasOwnProperty(item.url)) {
          searchResults[item.url] = [];
        }
        searchResults[item.url].push(item);
      }
      if (finishedQueries >= searchQuery.length) {
        sendTopResults();
      }
    });
  }
}

function sendTopResults() { 
  console.log(searchResults);
  
  var counts = [];
  var result = [];
  for (var key in searchResults) {
    if (searchResults.hasOwnProperty(key)) {
      counts.push({url: key, count: searchResults[key].length});
    }
  }
  counts.sort(function(a,b) {
    return b.count-a.count;
  });
  result.push({id: "root", url: rootUrl, title: rootTitle});
  var length = MAX_DRAW_RESULTS;
  if (counts.length < length) {
    length = counts.length;
  }
  for (var i=0; i<length; i++) {
    var item = searchResults[counts[i].url][0];
    item.type = "page";
    result.push(item);
  }
  for (var i=0; i<searchQuery.length; i++) {
    result.push({tag: searchQuery[i], type: "tag"});
  }
  receiveHistoryResults(result);
}

function runSearchFromNode(node) {
	var query = node.name;
	for (var i=0; i<navigationStack.length; i++) { query += ' ' + navigationStack[i]; }
	console.log("query: " + query);

	chrome.history.search({text: query, startTime: 0, maxResults: MAX_SEARCH_RESULTS}, function(results) {
		var qr = [];
		for (var i=0; i<results.length; i++) {
			var r = results[i];
			r.type = "page";
			qr.push(r);
		}
		receiveHistoryResultsForNode(node, qr);
	});
}

