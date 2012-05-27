
// morphs tree if modified and centers viz on given node
function centerOnNode(node, modified) {
    var doClick = function() {
        viz.onClick(node.id, {
            transition: $jit.Trans.Expo.easeOut,
            duration: moveDuration,
            modes: {
                position:'moebius'
            }
        });
    };
    
    if (modified) {
        var doMorph = function() {
            viz.op.morph(root, {
                type: 'fade:con',
                duration: d,
                transition: $jit.Trans.Expo.easeOut,
                modes: {
                    position: 'linear'
                }
            });
        }
        doMorph();
        setTimeout(doClick, d+50);
    } else {
        doClick();
    }
}

function onNodeClick(node) {
    if (node.id == "root") {
        addTagChildren(node, availableTags);
        centerOnNode(node, true);
    } else if (node.data.category == "page") {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.create({
                url:node.data.url,
            index: tab.index+1
            });
        });
    } else {
        navigationStack.push(node.name);
        addTagChildren(node, availableTags);
        runSearchFromNode(node, function () {
            centerOnNode(node, true);
        }, NUM_EXPANDED_RESULTS);
            // ht.graph.computeLevels(node.id);
            // ht.graph.eachBFS(node.id, function(n) {
            //     if (n._depth >= 2 && !navigationStack.include(n.name) && n.id != "root") {
            //         ht.labels.disposeLabel(n.id);
            //         ht.graph.removeNode(n.id);
            //     }
            // });
            // ht.refresh(true);
            // // move & zoom on node...
            // ht.onClick(node.id, {
            //     onComplete: function() {
            //         ht.controller.onComplete();
            //     }
            // });
    }
}

function removePageNodes(parentNode, continuation) {
    var cs = parentNode.children;
    var removeIds = [];
    var keeps = [];
    for (var i=0; i<cs.length; i++) {
        if (cs[i].data.category == "page") {
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
            var lblhtml;
            // console.log(node.data.category)
            if (node.id === "root") {
                var lblhtml = ''+
                    '<div id="rootlbl" style="positioning:relative; top:-100px; width:100%; ' +
                    'border-style:solid; border-width:2px; border-color:#444" >' +
                    '  <div style="font-size:'+1.25+'em; font-weight:bold">' +
                    '       '+node.name+'' +
                    '  </div>' +
                    '  <img src="'+ node.data.screenshot + '" width=100% />' +
                    '</div>';
                domElement.innerHTML = lblhtml;
                style.width=Math.max(200*(4-node._depth)/4,20)+'px';
            } else if (node.data.category == "tag") {
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

            if (node.id === "root") {
                style.width=Math.max(200*(4-node._depth)/4,20)+'px';
            }

            style.display = '';
            style.cursor = 'pointer';
            style.opacity = 1.0;

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
        }
    });
    //load JSON data.
    viz.loadJSON(json_empty);
    //compute positions and plot.
    viz.refresh(true);
    //end
    ht.controller.onComplete();

    while (callbackAfterInit.length > 0) {
        (callbackAfterInit.shift())();
    }
}

window.onload = init;

