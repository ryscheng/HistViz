chrome.extension.onRequest.addListener(handleRequests);

NUM_TAGS=7;
var availableTags;
var navigationStack = [];

function handleRequests(request, sender, sendResponse) {
    if (request.receiver == "rootScreenshot") {
        receiveRootScreenshot(request.screenshot);
    } else if (request.receiver == "initialKeywords") {
        initialKeywords(request, sender, sendResponse);
    }
}

function tokenizeTitle(title) {
    var regex = /[^a-z0-9 ]/gi;
    title = title.replace(regex, "");
    var titleArr = title.split(" ");
    var result = [];
    for (var i=0;i<titleArr.length;i++) {
        if (titleArr[i] != "") {
            result.push(titleArr[i]);
        }
    }
    return result;
}

function initialKeywords(request, sender, sendResponse) {
    console.log("Got new keywords");
    if (request.root) {
        var root = { id: 'root', title: request.title, url: request.url, screenshot: request.screenshot };
        var titletags = tokenizeTitle(request.title);
        var tags;
        if (request.tags) {
            tags = request.tags.concat(titletags);
        } else {
            request.tags = (titletags);
            tags = request.tags;
        }

        console.log(request);
        console.log(tags);
        availableTags = {};
        for (var i=0; i<tags.length; i++) {
            // choose the first tags that come (ranking them might be preferable)
            availableTags[tags[i].toLowerCase()] = (i<NUM_TAGS)?true:false;
        }
        receiveRoot(root); //notify graph_test that it can start loading tags
    }
}

function runSearchFromNode(node, cont, numResults) {
    numResults = numResults || NUM_PREVIEW_RESULTS;
    console.log("runSearchFromNode");

    var query = node.name;
    for (var i=0; i<navigationStack.length; i++) { query += ' ' + navigationStack[i]; }
    console.log("query: " + query);

    chrome.history.search({text: query, startTime: 0, maxResults: numResults}, function(results) {
        var qr = [];
        for (var i=0; i<results.length; i++) {
            var r = results[i];
            if (r.url.indexOf("chrome-extension") == -1) {
                r.type = "page";
                qr.push(r);
            }
        }
        receiveHistoryResultsForNode(node, qr, cont);
    });
}

