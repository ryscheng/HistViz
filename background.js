init();
var histviztab;
var current_screenshot;
var webtags = new HARDWEBTAGS();

function init() {
  console.log("HistViz init()");
  chrome.browserAction.onClicked.addListener(startHistViz);
}

function startHistViz(tab) {
  // extract keywords from the current page
  histviztab = null;
  current_screenshot = null;
  chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
    var tab = tabs[0];
    var title = tab.title;
    console.log("Current Window is URL="+tab.url+", Title="+title);
    var domain = tab.url.split("/")[2];
    chrome.tabs.captureVisibleTab(function(dataurl) {
  	  current_screenshot = dataurl;
      chrome.tabs.create({url:chrome.extension.getURL("graph_test.html"), index:tab.index+1}, function(tab) {
        histviztab = tab;
        var tags = webtags.lookup(domain);
        console.log("Created viz @"+tab.url);
        console.log(tags);
        chrome.tabs.sendRequest(histviztab.id, {receiver:'rootScreenshot', screenshot:current_screenshot });
        chrome.tabs.sendRequest(histviztab.id, {
          receiver:'initialKeywords', 
          root: true, 
          domain: domain, 
          title: title, 
          url: tab.url, 
          tags: tags, 
          screenshot: current_screenshot});
      });
    });
  });
}

//DEPRECATED
function searchDeliciousUrl(domain, title, url) {
  function parseDomForTags(dom) {
    var tagStr = "";
    var taglinks = $("a[rel='tag']",dom);
    //console.log(taglinks)
    if (taglinks.length>0) {
      tagStr = taglinks[0].text;
    }
    for (var i=1; i<taglinks.length; i++) {
      var taglink = taglinks[i].text;
      if (taglink != "") {
        tagStr = tagStr + " " + taglink;
      }
    }
    var regex = /[^a-z0-9 ]/gi;
    title = title.replace(regex, "");
    var titleArr = title.split(" ");
    console.log(titleArr);
    for (var i=0;i<titleArr.length;i++) {
      if (titleArr[i] != "") {
        tagStr = titleArr[i] + " " + tagStr;
      }
    }

    console.log(tagStr);  
    chrome.tabs.sendRequest(histviztab.id, {receiver:'initialKeywords', root: true, domain: domain, title: title, url: url, tags: tagStr, screenshot: current_screenshot});
  }
  var deliciousUrl = "http://delicious.com/url/"+domain;
  console.log("Retrieving tags from "+deliciousUrl)
  $.get(deliciousUrl, {}, parseDomForTags);
}

