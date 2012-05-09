<script>
init();

function init() {
  console.log("HistViz init()");
  chrome.browserAction.onClicked.addListener(startHistVizTab);
}

function startHistVizTab(tab) {
  console.log(tab);
  chrome.tabs.create({url:chrome.extension.getURL("graph_test.html")});
}
</script>
