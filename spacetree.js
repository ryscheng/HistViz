var labelType, useGradients, nativeTextSupport, animate;

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

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};

var st;
var tree;

function init(){
    // init data
    tree = {
        "id": "root",
        "name": "",
        "data": {
        }
    };
    
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
    st = new $jit.ST({
        injectInto: 'infovis',
        orientation: 'left',
        align: 'center',
        //set duration for the animation
        duration: 800,
        
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
        //set max levels to show. Useful when used with
        //the request method for requesting trees of specific depth
        levelsToShow: 2,
        
        Margin: {
            left: -500
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
                addTagChildren(nodeId, availableTags, function(ans) {
                    console.log("cont");
                    console.log(ans);
                    onComplete.onComplete(nodeId, ans);
                });
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
                    '       '+rootName+'' +
                    '  </div>' +
                    '  <img src="'+ rootScreenshot + '" width=100% />' +
                    // '    <div style="font-size:'+0.5*node.depthScale()+'em; font-weight:lighter">' +
                    // '    '+node.data.visited_date+'' +
                    // '   </div>' +
                    '</div>';
                    label.innerHTML = lblhtml;
                }
                style.width=Math.max(200*(4-node._depth)/4,20)+'px';
             
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

                // console.log(node.getData("dim"))
                // lblhtml += "<img src='img/thumb-google.png' width='" + node.getData("dim")*2 + "em' height='" + node.getData("dim")*2 + "em'></img>"
                // lblhtml += "<img src='img/thumb-google.png' class=node_thumbnail></img>"
                // lblhtml += "<img src='chrome://favicon/" + node.data.url + "'></img>"
                // lblhtml += "<div style='font-size:0.5em; font-weight:lighter'>" + node.data.visited_date + " - " + node.data.visited_time + "</div>"
            }
            label.innerHTML =  lblhtml;

            //label.id = node.id;            
            //label.innerHTML = node.name;
            label.onclick = function(){
                if (node.data.category == "page") {
			              chrome.tabs.getCurrent(function(tab) {
			                  chrome.tabs.create({
			    	                url:node.data.url,
			    	                index: tab.index+1
			                  });
  	                });
			          } else {
                    navigationStack.push(node.name);
                    st.onClick(node.id);
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
    st.loadJSON(tree);
    //compute node positions and layout
    st.compute();
    //emulate a click on the root node.
    //end

    while (callbackAfterInit.length > 0) {
      var f = callbackAfterInit.shift();
      f(infovis);
    }
    

}

window.onload = init;
