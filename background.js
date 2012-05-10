init();

function init() {
  console.log("HistViz init()");
  chrome.browserAction.onClicked.addListener(getCurrentTab);
}

function getCurrentTab(tab) {
  chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT}, getKeywords);
  startHistViz();
}

function getKeywords(tabs) {
  var tab = tabs[0];
  console.log("New HistViz for URL="+tab.url+", Title="+tab.title);
  var domains = tab.url.split("/");
  searchDeliciousUrl(domains[2]);
}

function searchDeliciousUrl(url) {
  function parseDomForTags(dom) {
    var taglinks = $("a[rel='tag']",dom);
    console.log(taglinks)
    for (var i=0; i<taglinks.length; i++) {
      var taglink = taglinks[i];
      console.log(taglink.text);
    }
  }
  var deliciousUrl = "http://delicious.com/url/"+url;
  console.log("Retrieving tags from "+deliciousUrl)
  $.get(deliciousUrl, {}, parseDomForTags);
}

function startHistViz() {
  chrome.tabs.create({url:chrome.extension.getURL("graph_test.html")});
}

function print(stuff) {
  console.log(stuff);
}
