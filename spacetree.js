
function removePageNodes(parentNode, continuation) {
    var cs = parentNode.children;
    if (!cs) {
        continuation();
        return;
    }

    var toRemove = [];
    var remaining = [];
    for (var i=0; i<cs.length; i++) {
        var n = cs[i];
        if (n.data.category == "page") {
            toRemove.push(n);
        } else {
            remaining.push(n);
        }
    }
    parentNode.children = remaining;
    
    var removePage = function (cs, i) {
        var n = cs[i];

        if (n.data.category == "page") {
            viz.removeSubtree(n.id, true, 'animate', {
                duration: 100,
                onComplete: (i+1 < cs.length) ? 
                      function () { removePage(cs, i+1); } 
                    : continuation
            });
        } else {
            if (i+1 < cs.length) { removePage(cs, i+1); } else { continuation(); }
        }
    }
    if (toRemove.length > 0) {
        removePage(toRemove, 0);
    } else {
        continuation();
    }
}

function onNodeClick(node) {
    navigationStack = nodeIdToStack(node.id);
    viz.onClick(node.id); // calls 'request' to generate new children
}

function init(){
    //Implement a node rendering function called 'nodeline' that plots a straight line
    //when contracting or expanding a subtree.
    $jit.ST.Plot.NodeTypes.implement({
        'nodeline': {
          'render': function(node, canvas, animating) {
              if(animating === 'expand' || animating === 'contract') {
                  var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
                  var width  = nconfig.width, height = nconfig.height;
                  var algnPos = this.getAlignedPos(pos, width, height);
                  var ctx = canvas.getCtx(), ort = this.config.orientation;
                  ctx.beginPath();
                  if(ort == 'left' || ort == 'right') {
                      ctx.moveTo(algnPos.x, algnPos.y + height / 2);
                      ctx.lineTo(algnPos.x + width, algnPos.y + height / 2);
                  } else {
                      ctx.moveTo(algnPos.x + width / 2, algnPos.y);
                      ctx.lineTo(algnPos.x + width / 2, algnPos.y + height);
                  }
                  ctx.stroke();
              }
          }
        }
    });

    var infovis = document.getElementById('infovis');

    //init Spacetree
    //Create a new ST instance
    viz = new $jit.ST({
        injectInto: 'infovis',
        orientation: 'left',
        align: 'center',
        //set duration for the animation
        duration: 800,
        
        //offsetX: infovis.offsetWidth/2 - 100,
        //offsetY: 0,

        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 100,
        //set max levels to show. Useful when used with
        //the request method for requesting trees of specific depth
        levelsToShow: 1,
        Navigation: {  
            enable: true,  
            panning: 'avoid nodes',  
            zooming: 20  
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 20,
            width: 40,
            //use a custom
            //node rendering function
            type: 'nodeline',
            color:'#23A4FF',
            lineWidth: 2,
            align:"center",
            overridable: true
        },
        
        Edge: {
            type: 'bezier',
            lineWidth: 2,
            color:'#23A4FF',
            overridable: true
        },
        
        //Add a request method for requesting on-demand json trees. 
        //This method gets called when a node
        //is clicked and its subtree has a smaller depth
        //than the one specified by the levelsToShow parameter.
        //In that case a subtree is requested and is added to the dataset.
        //This method is asynchronous, so you can make an Ajax request for that
        //subtree and then handle it to the onComplete callback.
        //Here we just use a client-side tree generator (the getTree function).
        request: function(nodeId, level, onComplete) {
          //var ans = getTree(nodeId, level);
          //onComplete.onComplete(nodeId, ans);

            console.log("request: " + nodeId);
            var f = function() {
                if (nodeId == "root") {
                  onComplete.onComplete(nodeId, getSubtreePlusTags(nodeId, availableTags));
                } else {
                  generateChildren(nodeId, availableTags, function(ans) {
                    onComplete.onComplete(nodeId, ans);
                  });
                }
            };

            if (availableTags === undefined) {
                callbackAfterReceiveRoot.push(f);
            } else {
                f();
            }
        },
        
        onBeforeCompute: function(node){
            Log.write("loading " + node.name);
        },
        
        onAfterCompute: function(){
            Log.write("done");
        },
        
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
            var style = label.style;
            var lblhtml; // = "<div style='font-size:1.0em'>" + node.name + "</div>";
            // console.log(node.data.category)
            if (node.id == "root") {
                if (node.data.alreadySet != true) {
                    node.data.alreadySet = true;
                    var lblhtml = ''+
                    '<div id="rootlbl" style="positioning:relative; top:-100px; width:100%; ' +
                    'border-style:solid; border-width:2px; border-color:#444" >' +
                    '  <div style="font-size:'+1.25+'em; font-weight:bold">' +
                    '       '+root.name+'' +
                    '  </div>' +
                    '  <img src="'+ root.data.screenshot + '" width=100% />' +
                    // '    <div style="font-size:'+0.5*node.depthScale()+'em; font-weight:lighter">' +
                    // '    '+node.data.visited_date+'' +
                    // '   </div>' +
                    '</div>';
                    label.innerHTML = lblhtml;
                }
                style.width=Math.max(100*(4-node._depth)/4,20)+'px';
             
            } else if (node.data.category == "tag") {
                // console.log(node.getPos())
               lblhtml = node.name 
            } else if (node.data.category == "page") {
                label.title = node.name + "\n" + node.data.url;
                style.width=400+'px';
                style.borderStyle="solid";
                style.borderWidth="2px";
                style.borderColor="#444";
                
                lblhtml = '<img src="chrome://favicon/' + node.data.url + '" />' +
                    '<span style="width:10px"> </span>' +
                    '<span style="font-weight:bold; font-size:0.8em; font-color:#000">' + 
                    node.name + 
                    '</span>' +
                    '<span style="width:20px"> </span>' +
                    '<span style="font-weight:lighter; font-size:0.5em; font-color:#333">' + 
                        node.data.visited_date + 
                    '</span>';

            }
            label.innerHTML =  lblhtml;

            label.onclick = function(){
                if (node.id == 'root') {
			        centerOnNode(root);
                } else {
                    onNodeClick(node);
                }
            };
            //set label styles
            //style.width = 40 + 'px';
            //style.height = 17 + 'px';            
            style.cursor = 'pointer';
            style.color = '#fff';
            style.backgroundColor = '#303030';
            //style.fontSize = '0.8em';
            style.textAlign= 'left';
            //style.textDecoration = 'underline';
            //style.paddingTop = '3px';
        },
        
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){
            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
                node.data.$color = "#ff7";
            }
            else {
                delete node.data.$color;
            }
        },
        
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#eed";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });
    //load json data
    viz.loadJSON(root);
    //compute node positions and layout
    viz.compute();
    //emulate a click on the root node.
    //end

    while (callbackAfterInit.length > 0) {
      (callbackAfterInit.shift())(infovis);
    }
}

window.onload = init;
