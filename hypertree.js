

function onNodeClick(node) {
    var tree = $jit.json.getSubtree(root, node.id);
    if (node.id == "root") {
        generateChildren(node.id, availableTags, true, function() {
            centerOnNode(tree, true);
        });
    } else if (node.data.category == "page") {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.create({
                url:node.data.url,
            index: tab.index+1
            });
        });
    } else {
        navigationStack = nodeIdToStack(node.id);
        var currLevel = navigationStack.length;

        var d = 1000;
        $jit.json.eachLevel(root, 0, currLevel, function(t, level) {
            if (level != 0 && t.data.category == "tag" && !isInNavigationStack(t)) {
                console.log('level ' + level + ' - ' + t.id);
                var n = viz.graph.getNode(t.id);
                viz.op.contract(n, { type: 'animate', duration: d });
            }
        });
        setTimeout(function() {
            generateChildren(node.id, availableTags, true, function() {
                centerOnNode(tree, true);
            });
        }, d+50);
    }
}

function removePageNodes(parentNode, continuation) {
    removeNodesCond(parentNode, function(node) { return node.data.category == "page" }, continuation);
}

function removeNodesCond(parentNode, condition, continuation) {
    var cs = parentNode.children;
    if (!cs) {
        continuation();
        return;
    }

    var removeIds = [];
    var keeps = [];
    for (var i=0; i<cs.length; i++) {
        if (condition(cs[i])) {
            animating = true;
            removeIds.push(cs[i].id);
        } else {
            keeps.push(cs[i]);
        }
    }
    parentNode.children = keeps;
    var d = 1000;
    viz.op.removeNode(removeIds, { 
        type: 'fade:con',  
        duration: d
    });

    setTimeout(continuation, d+50);
}

function rootLabelHTML() {
    var lblhtml = ''+
        '<div id="rootlbl" style="positioning:relative; top:-100px; width:100%; ' +
        'border-style:solid; border-width:2px; border-color:#444" >' +
        '  <div style="font-size:'+1.25+'em; font-weight:bold">' +
        '       '+root.name+'' +
        '  </div>' +
        '  <img src="'+ root.data.screenshot + '" width=100% />' +
        '</div>';
    return lblhtml;
}


function init(){
    //init data
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
    viz = new $jit.Hypertree({
        //id of the visualization container
        injectInto: 'infovis',
        //canvas width and height
        width: w,
        height: h,

        Navigation: {
            enable: true,
            panning: 'avoid nodes',
            zooming: 20
        },
        //Change node and edge styles such as
        //color, width and dimensions.
        Node: {
            dim: 20,
            type: 'circle',
            color: "#bdf",
            height: 50,
            width: 75,
            overridable: true,
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
            var scale = node.moebiusScale();
            var lblhtml;
            // console.log(node.data.category)
            if (node.id == "root") {
                console.log("root html");
                domElement.innerHTML = rootLabelHTML();
                style.width=Math.max(200*scale,20)+'px';
            } else if (node.data.category == "tag") {
                lblhtml = node.name 
            } else if (node.data.category == "page") {
                domElement.title = node.name + "\n" + node.data.url;
                style.width=200*scale+'px';
                style.borderStyle="solid";
                style.borderWidth="2px";
                style.borderColor="#444";

                lblhtml = ''+
                    '  <img src="chrome://favicon/' + node.data.url + '" />' +
                    '  <div style="font-weight:bold">' +
                    '       '+node.name+'' +
                    '  </div>' +
                    '  <div style="font-weight:lighter">' +
                    '    '+node.data.visited_date+
                    '  </div>';
            }
            domElement.innerHTML =  lblhtml;

            $jit.util.addEvent(domElement, 'click', function () {
                if (node.id == "root") {
                    centerOnNode(root);
                } else {
                    onNodeClick(node);
                }
            });
        },
        //Change node styles when labels are placed
        //or moved.
        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            var scale = node.moebiusScale();
            
            if (node.id == "root") {
                style.width=Math.max(200*scale,20)+'px';
            } else if (node.data.category == "page") {
                style.width = Math.max(200*scale, 50);
            }

            style.display = '';
            style.cursor = 'pointer';
            style.opacity = 1.0;

            style.fontSize = 1.0 * scale + 'em';
            
            domElement.title = scale;

            if (scale > 0.8) {
                //console.log("place label for new root: " + node.id);
                style.size = 15;
                //style.fontSize = "1.0em";
                style.color = "#000000";
                style.backgroundColor = "#F2F2F2";
            } else if (scale > 0.6) {
                //style.fontSize = "0.8em";
                style.color = "#ddd";
                style.backgroundColor = "#777";
            } else if(scale > 0.3) {
                //style.fontSize = "0.7em";
                style.color = "#555";
                style.backgroundColor = "#222";
            } else if (scale > 0.03) {
                //style.fontSize = "0.4em";
                style.borderStyle = "none";
                style.backgroundColor = '';
                // style.color = "#333";
                //style.display = 'none';
            } else {
                style.borderStyle = "none";
                style.backgroundColor = '';
                style.fontSize = "0em";
            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        },

        onComplete: function(){
            Log.write("done");
        }
    });
    //load JSON data.
    viz.loadJSON(root);
    //compute positions and plot.
    viz.refresh(true);
    //end
    viz.controller.onComplete();

    while (callbackAfterInit.length > 0) {
        (callbackAfterInit.shift())();
    }
}

window.onload = init;

