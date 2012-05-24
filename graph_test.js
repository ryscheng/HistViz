var labelType, useGradients, nativeTextSupport, animate;

var ht;
var backNode;
var screenshotURL;
var subtree;
var numTagsOutstanding;
var rootScreenshot;
var rootName;

var callbackAfterInit = [];
var callbackAfterReceiveRoot = [];

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

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

function isInNavigationStack(node) {
  var p = node.id.split(".");
  for (var i=1; i<p.length; i++) {
    if (p[i] != navigationStack[i]) {
      return false;
    }
  }
  return true;
}


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
    return 1; //return (4-this._depth)/4;
}

function receiveRootScreenshot(screenshot) {
  console.log('received screenshot');
	rootScreenshot = screenshot;
	tree.data.alreadySet = false;
    //ht.graph.computeLevels('root');
  st.labels.clearLabels();
	//st.refresh(true);
  var infovis = document.getElementById('infovis');
  st.onClick(st.root); //, getRootOffset());
}

function createTagSubtree(parentNodeId, tags) {
  var tree = {
    id: parentNodeId,
    children: []
  };
  addTagsToTree(tree, tags);
  return tree;
}
function addTagsToTree(tree, tags) {
  for (var t in tags) {
    if (tags[t] && !navigationStack.include(t)) {
  		var n = {
  			id: tree.id + '.' + t,
  			name: t,
  			data: {
  				category: "tag"
  			},
        children: []
  		};
      tree.children.push(n);
    }
  }
}

function generateChildren(nodeId, tags, cont) {
  var wholeTree = st.toJSON();

  var parentNode = $jit.json.getParent(wholeTree, nodeId);
//  parentNode.children = parentNode.children.filter(function(n) {
//    return n.data.category == "tag";
//  });
//  st.op.morph(wholeTree, { type:'fade', duration:100 }, {  
//    'node-property': ['height'],  
//  });
  var animating = false;

  var doSearch = function() {
    if (animating) {
      setTimeout(doSearch, 100);
    } else {
      var tree = $jit.json.getSubtree(st.toJSON(),nodeId);
      addTagsToTree(tree, tags);
      runSearchFromNode(tree, cont, 8);
    }
  };
  var doingSearchWithCallback = false;

  var cs = parentNode.children;
  for (var i=0; i<cs.length; i++) {
    if (cs[i].data.category == "page") {
      doingSearchWithCallback = true;
      animating = true;

      st.removeSubtree(cs[i].id, true, 'animate', {
        onComplete: function() {
          animating = false;
        }
      });
    }
  }
  
  setTimeout(doSearch, 100);
  //if (!doingSearchWithCallback) doSearch();

  //var tree = createTagSubtree(nodeId, tags);
}

//function addTagChildren(parentNodeId, tags, cont) {
//  console.log("addTagChildren(" + parentNodeId + ")");
//  console.log(tags);
//  console.log(navigationStack);
//  
//  subtree = {
//      id: parentNodeId,
//      children: []
//  };
//  console.log(tags);
// 
//  numTagsOutstanding = 0;
//  for (var t in tags) {
//    console.log(t);
//  	if (tags[t] && !navigationStack.include(t)) {
//  		var n = {
//  			id: parentNodeId + '.' + t,
//  			name: t,
//  			data: {
//  				category: "tag"
//  			},
//        children: []
//  		};
//      console.log(n); 
//  		//ht.graph.addAdjacence(parentNode, n);
//      subtree.children.push(n);
//  
//      numTagsOutstanding++;
//  		runSearchFromNode(n, cont);
//  	}
//  }
//}

function receiveRoot(root) {
	// at this point, tags are also loaded into 'graph_search.js::availableTags'
	console.log("received root: " + root + ", availableTags:");
	console.log(availableTags);

  var w = function(infovis) {
    console.log("receiveRoot");
    rootName = root.title
    while (callbackAfterReceiveRoot.length > 0) {
        var f = callbackAfterReceiveRoot.shift();
        f();
    }
    st.labels.clearLabels();
    st.onClick(st.root); //, getRootOffset());
  };

  if (st) {
		w(document.getElementById('infovis'));
	} else {
		callbackAfterInit.push(w);
	}
}

function receiveHistoryResultsForNode(parentNode, items, cont) {
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
			var d = new Date(items[i].lastVisitTime);
			var n = {
				id: parentNode.id + '.' + items[i].id,
				name: items[i].title,
				data: {
					category: 'page',
					url: items[i].url,
					visited_date: d.format()
				},
        children: []
			};
      parentNode.children.push(n);
		}
	}
  cont(parentNode);
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
          var style = domElement.style;
          var lblhtml; // = "<div style='font-size:1.0em'>" + node.name + "</div>";
          // console.log(node.data.category)
          if (node.data.category == "tag") {
              // console.log(node.getPos())
             lblhtml = node.name 
          } else if (node.data.category == "page") {
              domElement.title = node.name + "\n" + node.data.url;
              style.width=200*node.depthScale()+'px';
              style.borderStyle="solid";
              style.borderWidth="2px";
              style.borderColor="#444";
              
              lblhtml = ''+
              '  <img src="chrome://favicon/' + node.data.url + '" />' +
              '  <div style="font-size:'+1.0*node.depthScale()+'em; font-weight:bold">' +
              '       '+node.name+'' +
              '  </div>' +
              '  <div style="font-size:'+0.5*node.depthScale()+'em; font-weight:lighter">' +
              '    '+node.data.visited_date+
              '  </div>';
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

			    	if (node.data.category == "page") {
			    		chrome.tabs.getCurrent(function(tab) {
			    			chrome.tabs.create({
			    				url:node.data.url,
			    				index: tab.index+1
			    			});
  	          });
			    	} else {
			    		//ht.labels.clearLabels();
			    		ht.root = node.id;
			    		navigationStack.push(node.name);
              runSearchFromNode(node, 8);
			    		addTagChildren(node, availableTags);
			    		ht.graph.computeLevels(node.id);
			    		ht.graph.eachBFS(node.id, function(n) {
                if (n._depth >= 2 && !navigationStack.include(n.name) && n.id != "root") {
                  ht.labels.disposeLabel(n.id);
                  ht.graph.removeNode(n.id);
                }
			    	  });
              ht.refresh(true);
			    		// move & zoom on node...
              ht.onClick(node.id, {
                onComplete: function() {
                  ht.controller.onComplete();
                }
			    		});
			    	}
          });
      },
      //Change node styles when labels are placed
      //or moved.
      onPlaceLabel: function(domElement, node){
        var style = domElement.style;
        
        if (node.id === "root") {
			    if (node.data.alreadySet != true) {
            node.data.alreadySet = true;
            var lblhtml = ''+
            '<div id="rootlbl" style="positioning:relative; top:-100px; width:100%; ' +
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
          } else {
          }
          style.width=Math.max(200*(4-node._depth)/4,20)+'px';
		    }
          
        style.display = '';
        style.cursor = 'pointer';
        style.opacity = 1.0;
		    //style.backgroundColor = "#D2D2D2";
        
        if (node._depth == 0) {
			    //console.log("place label for new root: " + node.id);
			    style.size = 15;
          style.fontSize = "1.0em";
          style.color = "#000000";
			    style.backgroundColor = "#F2F2F2";
        } else if (node._depth <= 1) {
          style.fontSize = "0.8em";
          style.color = "#ddd";
			    style.backgroundColor = "#777";
        } else if(node._depth == 2){
          style.fontSize = "0.7em";
          style.color = "#555";
			    style.backgroundColor = "#222";
        } else {
			    style.fontSize = "0em";
          style.borderStyle = "none";
          style.backgroundColor = '';
			    // style.color = "#333";
          //style.display = 'none';
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

//window.onload = init;

