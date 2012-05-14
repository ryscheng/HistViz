init();
var histviztab;

function init() {
  console.log("HistViz init()");
  chrome.browserAction.onClicked.addListener(startHistViz);
}

function startHistViz(tab) {
  // extract keywords from the current page
  chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT}, getKeywordsFromTab);
  // open HistViz as a tab next to the current one
  chrome.tabs.create({url:chrome.extension.getURL("graph_test.html"), index:tab.index+1}, setHistVizTab);
}

function setHistVizTab(tab) {
  histviztab = tab;
  console.log("Created viz @"+tab.url);
}

function getKeywordsFromTab(tabs) {
  var tab = tabs[0];
  console.log("Current Window is URL="+tab.url+", Title="+tab.title);
  var domains = tab.url.split("/");
  searchDeliciousUrl(domains[2], tab.title, tab.url);
}

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
        tagStr = tagStr + " " + titleArr[i];
      }
    }

    console.log(tagStr);  
    chrome.tabs.sendRequest(histviztab.id, {root: true, domain: domain, title: title, url: url, tags: tagStr});
  }
  var deliciousUrl = "http://delicious.com/url/"+domain;
  console.log("Retrieving tags from "+deliciousUrl)
  $.get(deliciousUrl, {}, parseDomForTags);
}

function print(stuff) {
  console.log(stuff);
}
