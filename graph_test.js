var labelType, useGradients, nativeTextSupport, animate;

var ht;
var backNode;
var screenshotURL;

var callbackAfterInit = [];

Date.prototype.format = function() {
    var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec");
    return m_names[this.getMonth()] + ' ' + this.getDate() + ', ' + this.getFullYear();
}

String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

Array.prototype.include = function(item) {
	for (var i=0; i<this.length; i++) {
		if (this[i] == item) {
			return true;
		}
	}
	return false;
};


(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		c = this.cCodeAt(i);
		hash = ((hash<<5)-hash)+c;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};

$jit.Graph.Node.prototype.depthScale = function() {
    return (4-this._depth)/4;
}

function receiveHistoryResultsForNode(node, items) {
     
}

function receiveHistoryResults(items) {
    console.log("receiveHistoryResults() called")
    console.log(items);
    
    if (items[0].id != 'root') console.log("Error: First item not root!");
    
    // var rootNode = {"id":items[0].id, "name":items[0].title, "data":{"url":items[0].url}};
    var rootNode = ht.graph.getNode("root");
    rootNode.name = items[0].title;
    rootNode.data = {
        url: items[0].url
    }
    
    for (var i=1; i<items.length; i++) {
        if (items[i].tag) { // if it's a tag
            // do nothing for now
        } else {
            var d = new Date(items[i].lastVisitTime);
            var n = {
                "id": items[i].id,
                "name": items[i].title,
                "data": {
                    "category": 'page',
                    "url": items[i].url,
                    "visited_date": d.format()
                }
            };        
            ht.graph.addAdjacence(rootNode, n);
        }
    }
    ht.graph.computeLevels('root');
    ht.refresh(true);
}

function receiveRootScreenshot(screenshot) {
	var root = ht.graph.getNode("root");
	root.data.screenshot = screenshot;
	root.data.alreadySet = false;
	ht.refresh(true);
}

function addTagChildren(parentNode, tags) {
	for (var t in tags) {
		if (tags[t] && !navigationStack.include(t)) {
			var n = {
				"id": parentNode.id + t,
				"name": t,
				"data": {
					"category": "tag"
				}
			};
			ht.graph.addAdjacence(parentNode, n);
			runSearchFromNode(n);
		}
	}
}

function receiveRoot(root) {
	// at this point, tags are also loaded into 'graph_search.js::availableTags'
	console.log("received root: " + root + ", availableTags:");
	console.log(availableTags);

	var w = function() {
	    var rootNode = ht.graph.getNode("root");
	    rootNode.name = root.title;
	    rootNode.data = {
	        url: root.url,
			screenshot: root.screenshot
	    }
		Log.write("loading");
		ht.refresh(true);
	
		addTagChildren(rootNode, availableTags);
	};

	if (ht) {
		w();
	} else {
		callbackAfterInit.push(w);
	}
}

function receiveHistoryResultsForNode(parentNode, items) {
	console.log("results " + parentNode.name + "(" + items.length + ")");
	if (items.length == 0) {
		//remove node if no matches
		console.log("remove node " + parentNode.name);
		ht.graph.removeNode(parentNode.id);
		ht.labels.disposeLabel(parentNode.id);
	}
	for (var i=0; i<items.length; i++) {
		if (items[i].tag) { // if it's a tag
			// do nothing for now
		} else {
			var id = items[i].id;
			var n;
			//if (ht.graph.hasNode(id)) {
			//	n = ht.graph.getNode(id);
			//} else {
				var d = new Date(items[i].lastVisitTime);
				n = {
					'id': parentNode.id + '.' + items[i].id,
					'name': items[i].title,
					'data': {
						'category': 'page',
						'url': items[i].url,
						'visited_date': d.format()
					}
				};
			//}
			ht.graph.addAdjacence(parentNode, n);
		}
	}
	ht.refresh(true);
}

function init(){
    //init data
    var json_empty = {
        "id": "root",
        "name": "",
        "data": {
        }
    };
    var infovis = document.getElementById('infovis');
    var w = infovis.offsetWidth - 50, h = infovis.offsetHeight - 50;
    
    $jit.Hypertree.Plot.NodeTypes.implement({
        'PageNode': {
            'render': function(node, canvas, animating) {
                var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
                var width  = nconfig.width, height = nconfig.height;
                // var algnPos = this.getAlignedPos(pos, width, height);
                var x = pos.x * 100, y = pos.y * 100;
                var ctx = canvas.getCtx();
                var grad = ctx.createLinearGradient(0,0,0,height);
                grad.addColorStop(0,"#aaaaaa");
                grad.addColorStop(1,"#444444");
                ctx.fillStyle = grad;
                ctx.fillRect(x-width/2,y-height/2,x+width,y+height);
                // var thumb = new Image();
                // thumb.src = "img/thumb-google.png";
                // ctx.drawImage(thumb, pos.x-50, pos.y-50, 100, 100);
            }
        }
    });
    
    //init Hypertree
    ht = new $jit.Hypertree({
      //id of the visualization container
      injectInto: 'infovis',
      //canvas width and height
      width: w,
      height: h,
      //Change node and edge styles such as
      //color, width and dimensions.
      Node: {
          dim: 20,
		  type: 'circle',
          color: "#bdf",
          height: 50,
          width: 75,
          // autoHeight: true,
          // autoWidth: true,
          overridable: true,
          // stylesHover: true,
          transform: true
      },
      Edge: {
          lineWidth: 2,
          color: "#068"
      },
	  NodeStyles: {
		  enable: false,
		  stylesHover: {
			  dim: 25
		  }
	  },
	  Label: {
		  type: 'HTML'
	  },
      // Tips: {  
      //   enable: true,  
      //   type: 'Native',  
      //   offsetX: 10,  
      //   offsetY: 10,  
      //   onShow: function(tip, node) {
      //     tip.innerHTML = node.data.url;  
      //   }  
      // },
      transition: $jit.Trans.Quart.easeInOut,
      onBeforeCompute: function(node) {
          Log.write("centering");
      },
	  onBeforePlotNode: function(node) {
		  // console.log("onBeforePlotNode: " + node.data.category)
		  if (node.data.category == "tag") {
              // console.log(node.name + ": " + node.data.category)
			  node.setData("color","#dfb");
			  node.setData("type", "ellipse");
              node.setData("width", 75*node.depthScale());
              node.setData("height", 50*node.depthScale());
		  } else if (node.data.category == "page") {
			  node.setData("color","#fdb");
		  }
	  },
      //Attach event handlers and add text to the
      //labels. This method is only triggered on label
      //creation
      onCreateLabel: function(domElement, node){
          var lblhtml; // = "<div style='font-size:1.0em'>" + node.name + "</div>";
          // console.log(node.data.category)
          if (node.data.category == "tag") {
              // console.log(node.getPos())
             lblhtml = node.name 
          } else if (node.data.category == "page") {
              lblhtml = ''+
              '<div title='+node.data.url+' style="width:'+200*node.depthScale()+'px;' +
              ' border-style:solid; border-width:2px; border-color:#444" >' +
              '  <img src="chrome://favicon/' + node.data.url + '" />' +
              '  <div style="font-size:'+1.0*node.depthScale()+'em; font-weight:bold">' +
              '       '+node.name+'' +
              '   </div>' +
              '    <div style="font-size:'+0.5*node.depthScale()+'em; font-weight:lighter">' +
              '    '+node.data.visited_date+'' +
              '   </div>' +
              '</div>';
              // console.log(node.getData("dim"))
              // lblhtml += "<img src='img/thumb-google.png' width='" + node.getData("dim")*2 + "em' height='" + node.getData("dim")*2 + "em'></img>"
              // lblhtml += "<img src='img/thumb-google.png' class=node_thumbnail></img>"
              // lblhtml += "<img src='chrome://favicon/" + node.data.url + "'></img>"
              // lblhtml += "<div style='font-size:0.5em; font-weight:lighter'>" + node.data.visited_date + " - " + node.data.visited_time + "</div>"
          }
            domElement.innerHTML =  lblhtml;
          // 
          // var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
          // var width  = nconfig.width, height = nconfig.height;
          // // var algnPos = this.getAlignedPos(pos, width, height);
          // var x = pos.x * 100, y = pos.y * 100;
          // var ctx = domElement.canvas.getCtx();
          // var grad = ctx.createLinearGradient(0,0,0,height);
          // grad.addColorStop(0,"#aaaaaa");
          // grad.addColorStop(1,"#444444");
          // ctx.fillStyle = grad;
          // ctx.fillRect(x-width/2,y-height/2,x+width,y+height);
          
          
          $jit.util.addEvent(domElement, 'click', function () {
			  console.log("do search with: " + node.name)
              // var n = {};
              // n.id = 'bholt';
              // n.name = 'Brandon';
              // n.data = {};
              // n.data.category = 'page';
              // n.data.visited_date = 'yesterday';
              // n.data.visited_time = 'never';
              // ht.graph.addAdjacence(node, n);
              
              // console.log(node.getSubnodes())
              // ht.graph.addAdjacence(node, {'id':'bholt', 'name':'Brandon', 'data':{'category':'page'}});
              // ht.graph.addAdjacence(node, {'id':'ryscheng', 'name':'Ray', 'data':{'category':'page'}});
              // ht.graph.computeLevels("root");
              // ht.refresh(true);
              // receiveHistoryResults();

			if (node.category == "page") {
				chrome.tabs.getCurrent(function(tab) {
					chrome.tabs.create({
						url:node.data.url,
						index: tab.index+1
					});
  	        	});
			} else {
            	// update graph visualization...
            	ht.onClick(node.id, {
            		onComplete: function() {
            			ht.controller.onComplete();
						navigationStack.push(node.name);
						addTagChildren(node, availableTags);
            		}
				});
			}
          });
      },
      //Change node styles when labels are placed
      //or moved.
      onPlaceLabel: function(domElement, node){
          if (node.id == "root" && node.data.alreadySet != true) {
              node.data.alreadySet = true;
              var lblhtml = ''+
              '<div style="positioning:relative; top:-100px; width:'+200+'px; ' +
              'border-style:solid; border-width:2px; border-color:#444" >' +
              '  <div style="font-size:'+1.25+'em; font-weight:bold">' +
              '       '+node.name+'' +
              '  </div>' +
              '  <img src="'+ node.data.screenshot + '" width=100% />' +
              // '    <div style="font-size:'+0.5*node.depthScale()+'em; font-weight:lighter">' +
              // '    '+node.data.visited_date+'' +
              // '   </div>' +
              '</div>';
              domElement.innerHTML = lblhtml;
          }
          
          var style = domElement.style;
          style.display = '';
          style.cursor = 'pointer';
          style.opacity = 1.0;
		  style.backgroundColor = "#D2D2D2";
          if (node._depth == 0) {
			  style.size = 15;
              // style.fontSize = "1.0em";
              style.color = "#000000";
			  style.backgroundColor = "#F2F2F2";
          } else if (node._depth <= 1) {
              // style.fontSize = "0.8em";
              style.color = "#ddd";
			  style.backgroundColor = "#777";
          } else if(node._depth == 2){
              // style.fontSize = "0.7em";
              style.color = "#555";
			  style.backgroundColor = "#222";
          } else {
			  // style.fontSize = "0.4em";
			  // style.color = "#333";
              style.display = 'none';
          }

          var left = parseInt(style.left);
          var w = domElement.offsetWidth;
          style.left = (left - w / 2) + 'px';
      },
      
      onComplete: function(){
          Log.write("done");
          
          //Build the right column relations list.
          //This is done by collecting the information (stored in the data property) 
          //for all the nodes adjacent to the centered node.
          // var node = ht.graph.getClosestNodeToOrigin("current");
          // console.log(node)
          //         
          // var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
          // html += "<ul>";
          // node.eachAdjacency(function(adj){
          //     var child = adj.nodeTo;
          //     if (child.data) {
          //         var rel = (child.data.band == node.name) ? child.data.relation : node.data.relation;
          //         html += "<li>" + child.name + " " + "<div class=\"relation\">(relation: " + rel + ")</div></li>";
          //     }
          // });
          // html += "</ul>";
          // $jit.id('inner-details').innerHTML = html;
      }
    });
    //load JSON data.
    ht.loadJSON(json_empty);
    //compute positions and plot.
    ht.refresh(true);
    //end
    ht.controller.onComplete();
	
	while (callbackAfterInit.length > 0) {
		var f = callbackAfterInit.shift();
		f();
	}
}

window.onload = init;

function rayPrint(msg) {
  console.log("RAY SENDS:"+msg);
}
