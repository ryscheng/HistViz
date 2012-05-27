var labelType, useGradients, nativeTextSupport, animate;

var viz;
var root = {
    id: 'root',
    name: '',
    data: {
        category: "root",
        screenshot: 'img/icon.png'
    },
    children: []
};
var current; // currently centered node
var availableTags;
var navigationStack = [];

var callbackAfterInit = [];
var callbackAfterReceiveRoot = [];

NUM_PREVIEW_RESULTS = 3;
NUM_EXPANDED_RESULTS = 8;
NUM_TAGS=7;

///////////////
// Prototypes
///////////////
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

if (!Array.prototype.filter) {
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

$jit.Graph.Node.prototype.moebiusScale = function() {
    return (1 - (this.pos.getc()).squaredNorm());
}
    
function isInNavigationStack(node) {
    var p = node.id.split(".");
    for (var i=1; i<p.length; i++) {
        if (p[i] != navigationStack[i-1]) {
            return false;
        }
    }
    return true;
}

function nodeIdToStack(nodeId) {
    var s = nodeId.split(".");
    var res = [];
    for (var i=1; i<s.length; i++) {
        res.push(s[i]);
    }
    return res;
}

function nodeDepth(nodeId) {
    return nodeId.split(".").length - 1;
}

function childrenIncludeTag(children, tag) {
    return childrenInclude(children, 'name', tag);
}

function childrenInclude(children, field, value) {
    for (var i=0; i<children.length; i++) {
        if (children[i][field] == value) {
            return true;
        }
    }
    return false;
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
    if (this._depth) {
        return (4-this._depth)/4;
    } else {
        return 1;
    }
}

function clearSidebar() {
    var table = document.getElementById('filtertable');
    while (table.hasChildNodes() ){
        table.removeChild(table.firstChild);
    }
}

function tagBoxClicked(tag){
    var d = 1000;
    availableTags[tag] = ! availableTags[tag];
    console.log("availableTags for " + tag + ": " + availableTags[tag]);
    if( availableTags[tag]){
        console.log("start using tag: " + tag);

        $jit.json.each(root, function(node) {
            if (node.id == "root" || (node.data.category == "tag" && node.children.length > NUM_PREVIEW_RESULTS)) {
                addTagsToTree(node, availableTags);
            }
        });
        viz.op.morph(root, {
            type: 'fade:seq',
            duration: d,
            transition: $jit.Trans.Expo.easeOut
        });
    }
    else {
        console.log("stop using tag: " + tag);
        $jit.json.each(root, function (node) {
            node.children = node.children.filter(function(child) { return child.name != tag; });
        });
        viz.op.morph(root, {
            type: 'fade:seq',
            duration: d,
            transition: $jit.Trans.Expo.easeOut
        });
    }
}

function addTagToSidebar(tag, ifchecked){
    var chk = document.createElement("INPUT");
    chk.setAttribute("type","checkbox");
    chk.setAttribute("name",tag+'_box_');
    chk.setAttribute("title", tag);

    console.log("tag: "); + tag
        chk.onclick = function() { tagBoxClicked(tag); };
    chk.checked = ifchecked;

    var table = document.getElementById('filtertable');
    var newRow = document.createElement("tr");
    var newCol = document.createElement("td");
    var newTxt = document.createTextNode(tag);


    newCol.appendChild(newTxt);
    newCol.appendChild(chk);
    newRow.appendChild(newCol);
    table.appendChild(newRow);
}

function receiveRootScreenshot(screenshot) {
    root.data.screenshot = screenshot;
    if (viz != undefined) {
        console.log("clearing labels");
        var label = viz.labels.getLabel('root');
        label.innerHTML = rootLabelHTML();
    }
}

function createTagSubtree(parentNodeId, tags) {
    var subtree = {
        id: parentNodeId,
        children: []
    };
    addTagsToTree(subtree, tags);
    return subtree;
}

function getSubtreePlusTags(parentNodeId, tags) {
    var subtree = $jit.json.getSubtree(root, parentNodeId);
    addTagsToTree(subtree, tags);
    return subtree;
}

function addTagsToTree(node, tags, previewResults, continuation) {
    if (continuation === undefined) {
        if (previewResults === undefined) {
            continuation = function() {};
        } else {
            continuation = previewResults;
        }
        previewResults = false;
    }
    console.log(navigationStack);
    for (var t in tags) {
        if (tags[t] && !navigationStack.include(t) && !childrenIncludeTag(node.children, t)) {
            var n = {
                id: node.id + '.' + t,
                name: t,
                data: {
                    category: "tag"
                },
                children: []
            };
            node.children.push(n);
        }
    }
    if (previewResults) {
        var genPreview = function(children, i) {
            var child = children[i];
            console.log(children);
            console.log(i + " - " + child.data);
            if (child.data.category == "tag") {
                runSearchFromNode(child, function() {
                    if (i+1<children.length) {
                        genPreview(children, i+1);
                    } else {
                        continuation();
                    }
                });
            } else {
                if (i+1<children.length) {
                    genPreview(children, i+1);
                } else {
                    continuation();
                }
            }
        };
        genPreview(node.children, 0);
    } else {
        continuation();
    }
}

function generateChildren(nodeId, tags, preview, continuation) {
    if (continuation === undefined) {
        continuation = preview;
        preview = false;
    }
    var parentNode = $jit.json.getParent(root, nodeId);
    console.log("parent of " + nodeId + " is " + parentNode);

    var doSearch = function() {
        var tree = $jit.json.getSubtree(root,nodeId);
        tree.children = [];
        addTagsToTree(tree, tags, preview, function() {
            runSearchFromNode(tree, continuation, NUM_EXPANDED_RESULTS);
        });
    };

    removePageNodes(parentNode, doSearch);
}

function receiveRoot(res) {
    // at this point, tags are also loaded into 'graph_search.js::availableTags'
    console.log("received root: " + root + ", availableTags:");
    console.log(availableTags);

    for (var t in availableTags) {
        addTagToSidebar(t, availableTags[t]);
    }

    var w = function(infovis) {
        console.log("receiveRoot");
        root.name = res.title
        while (callbackAfterReceiveRoot.length > 0) {
            (callbackAfterReceiveRoot.shift())();
        }
        var rootLabel = viz.labels.getLabel('root');
        rootLabel.innerHTML = rootLabelHTML();
        onNodeClick(root);
    };

    if (viz) {
        w(document.getElementById('infovis'));
    } else {
        callbackAfterInit.push(w);
    }
}

function receiveHistoryResultsForNode(node, items, continuation) {
    var tree = $jit.json.getSubtree(root, node.id);
    console.log("results " + node.name + "(" + items.length + ")");
    if (items.length == 0) {
        // remove tree if no matches
        console.log("remove tree " + tree.name);
        var d = 1000;
        viz.op.removeNode(removeIds, { 
            type: 'fade:con',  
            duration: d
        });
        //viz.labels.disposeLabel(tree.id);
    }
    for (var i=0; i<items.length; i++) {
        if (items[i].tag) { // if it's a tag
            // do nothing for now
        } else {
            var id = items[i].id;
            var d = new Date(items[i].lastVisitTime);
            var n = {
                id: tree.id + '.' + items[i].id,
                name: items[i].title,
                data: {
                    category: 'page',
                    url: items[i].url,
                    visited_date: d.format()
                },
                children: []
            };
            //if (!childrenInclude(tree.children, 'id', n.id)) {
            tree.children.push(n);
            //}
        }
    }
    continuation(tree);
}

// morphs tree if modified and centers viz on given node
function centerOnNode(node, modified) {
    var d = 1000;
    var doClick = function() {
        viz.onClick(node.id, {
            transition: $jit.Trans.Expo.easeOut,
            duration: d
        });
    };
    
    if (modified) {
        var doMorph = function() {
            viz.op.morph(root, {
                type: 'fade:con',
                duration: d,
                transition: $jit.Trans.Expo.easeOut,
            });
        }
        doMorph();
        setTimeout(doClick, d+50);
    } else {
        doClick();
    }
}
