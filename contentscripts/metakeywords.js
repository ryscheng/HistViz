$(document).ready(function() {
  var tags=[];
  var keywords = $("meta[name='keywords']");
  for (var i=0; i<keywords.length; i++){
    var keywordTags=keywords[i].content.split(',');
    for (var j=0; j<keywordTags.length; j++) {
      tags.push(keywordTags[j].trim());
    }
  }
  chrome.extension.sendRequest({url: window.location.href, tags: tags}, function(response) {
  });
  //console.log(tags);
});
