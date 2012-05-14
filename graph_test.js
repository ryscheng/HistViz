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

function receiveHistoryResults(items) {
  console.log(items);
    
}

function init(){
    //init data
    var json_old = {
        "id": "root",
        "name": "Nine Inch Nails",
        "data": {
            "category": "page"
        },
        "children": [{
            "id": "126510_1",
            "name": "Jerome Dillon",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band",
                "category": "tag"
            },
            "children": [{
                "id": "52163_2",
                "name": "Howlin' Maggie",
                "data": {
                    "band": "Jerome Dillon",
                    "relation": "member of band",
                    "$color": "#FFFF00",
                    "$size": "1000",
                    "category": "page"
                },
                "children": []
            }, {
                "id": "324134_3",
                "name": "nearLY",
                "data": {
                    "band": "Jerome Dillon",
                    "relation": "member of band",
                    "category": "page"
                },
                "children": []
            }]
        }, {
            "id": "173871_4",
            "name": "Charlie Clouser",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": []
        }, {
            "id": "235952_5",
            "name": "James Woolley",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": []
        }, {
            "id": "235951_6",
            "name": "Jeff Ward",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": [{
                "id": "2382_7",
                "name": "Ministry",
                "data": {
                    "band": "Jeff Ward",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "2415_8",
                "name": "Revolting Cocks",
                "data": {
                    "band": "Jeff Ward",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "3963_9",
                "name": "Pigface",
                "data": {
                    "band": "Jeff Ward",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "7848_10",
                "name": "Lard",
                "data": {
                    "band": "Jeff Ward",
                    "relation": "member of band"
                },
                "children": []
            }]
        }, {
            "id": "235950_11",
            "name": "Richard Patrick",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": [{
                "id": "1007_12",
                "name": "Filter",
                "data": {
                    "band": "Richard Patrick",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "327924_13",
                "name": "Army of Anyone",
                "data": {
                    "band": "Richard Patrick",
                    "relation": "member of band"
                },
                "children": []
            }]
        }, {
            "id": "2396_14",
            "name": "Trent Reznor",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": [{
                "id": "3963_15",
                "name": "Pigface",
                "data": {
                    "band": "Trent Reznor",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "32247_16",
                "name": "1000 Homo DJs",
                "data": {
                    "band": "Trent Reznor",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "83761_17",
                "name": "Option 30",
                "data": {
                    "band": "Trent Reznor",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "133257_18",
                "name": "Exotic Birds",
                "data": {
                    "band": "Trent Reznor",
                    "relation": "member of band"
                },
                "children": []
            }]
        }, {
            "id": "36352_19",
            "name": "Chris Vrenna",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": [{
                "id": "1013_20",
                "name": "Stabbing Westward",
                "data": {
                    "band": "Chris Vrenna",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "3963_21",
                "name": "Pigface",
                "data": {
                    "band": "Chris Vrenna",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "5752_22",
                "name": "Jack Off Jill",
                "data": {
                    "band": "Chris Vrenna",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "33602_23",
                "name": "Die Warzau",
                "data": {
                    "band": "Chris Vrenna",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "40485_24",
                "name": "tweaker",
                "data": {
                    "band": "Chris Vrenna",
                    "relation": "is person"
                },
                "children": []
            }, {
                "id": "133257_25",
                "name": "Exotic Birds",
                "data": {
                    "band": "Chris Vrenna",
                    "relation": "member of band"
                },
                "children": []
            }]
        }, {
            "id": "236021_26",
            "name": "Aaron North",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": []
        }, {
            "id": "236024_27",
            "name": "Jeordie White",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": [{
                "id": "909_28",
                "name": "A Perfect Circle",
                "data": {
                    "band": "Jeordie White",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "237377_29",
                "name": "Twiggy Ramirez",
                "data": {
                    "band": "Jeordie White",
                    "relation": "is person"
                },
                "children": []
            }]
        }, {
            "id": "235953_30",
            "name": "Robin Finck",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": [{
                "id": "1440_31",
                "name": "Guns N' Roses",
                "data": {
                    "band": "Robin Finck",
                    "relation": "member of band"
                },
                "children": []
            }]
        }, {
            "id": "235955_32",
            "name": "Danny Lohner",
            "data": {
                "band": "Nine Inch Nails",
                "relation": "member of band"
            },
            "children": [{
                "id": "909_33",
                "name": "A Perfect Circle",
                "data": {
                    "band": "Danny Lohner",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "1695_34",
                "name": "Killing Joke",
                "data": {
                    "band": "Danny Lohner",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "1938_35",
                "name": "Methods of Mayhem",
                "data": {
                    "band": "Danny Lohner",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "5138_36",
                "name": "Skrew",
                "data": {
                    "band": "Danny Lohner",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "53549_37",
                "name": "Angkor Wat",
                "data": {
                    "band": "Danny Lohner",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "113510_38",
                "name": "Puscifer",
                "data": {
                    "band": "Danny Lohner",
                    "relation": "member of band"
                },
                "children": []
            }, {
                "id": "113512_39",
                "name": "Renhold\u00ebr",
                "data": {
                    "band": "Danny Lohner",
                    "relation": "is person"
                },
                "children": []
            }]
        }],
        "data": []
    };
    var json = {
        "id": "root",
        "name": "Yelp - seafood boston",
        "data": {
            "category": "page",
            "url": "http://yelp.com/c/boston/seafood",
            "visited_date": "Sun, Oct. 23",
            "visited_time": "10:03am"
        },
        "children": [{
            "id": "120",
            "name": "restaurants",
            "data": {
                "category": "tag",
            },
            "children": [{
                "id": "121",
                "name": "Yelp - clam chowder",
                "data": {
                    "category": "page",
                    "url": "http://yelp.com/c/clam",
                    "visited_date": "Sun, Oct. 23",
                    "visited_time": "10.30am"
                },
                "children": []
            }, {
                "id": "122",
                "name": "seafood",
                "data": {
                    "category": "tag"
                },
                "children": []
            }, {
                "id": "123",
                "name": "american",
                "data": {
                    "category": "tag"
                }
            }, {
                "id": "124",
                "name": "Yelp - Neptune Oyster",
                "data": {
                    "category": "page",
                    "url": "http://www.yelp.com/biz/neptune-oyster-boston",
                    "visited_date": "Sat, June 1",
                    "visited_time": "5:33pm"
                }
            }]
        }, {
            "id": "130",
            "name": "Clam chowder Boston",
            "data": {
                "category": "page",
                "url": "http://www.yelp.com/search?find_desc=clam+chowder",
                "visited_date": "Sun, Oct. 23",
                "visited_time": "10.30am"
            },
            "children": [{
                "id": "131",
                "name": "Yelp - Neptune Oyster",
                "data": {
                    "category": "page",
                    "url": "http://www.yelp.com/biz/neptune-oyster-boston",
                    "visited_date": "Sat, June 1",
                    "visited_time": "5:33pm"
                }
            }, {
                "id": "132",
                "name": "Atlantic Fish",
                "data": {
                    "category": "page",
                    "url": "http://www.atlanticfishco.com/",
                    "visited_date": "Sat, June 1",
                    "visited_time": "5:35pm"
                }
            }]
        }, {
            "id": "140",
            "name": "attractions",
            "data": {
                "category": "tag"
            },
            "children": [{
                "id": "141",
                "name": "museums",
                "data": {
                    "category": "tag"
                }
            }, {
                "id": "142",
                "name": "historical landmarks",
                "data": {
                    "category": "tag"
                }
            }, {
                "id": "143",
                "name": "Boston Symphony Orchestra",
                "data": {
                    "category": "page",
                    "url": "http://bso.org/",
                    "visited_date": "Mon, June 8",
                    "visited_time": "4:44pm"
                },
                "children": []
            }]
        }, {
            "id": "150",
            "name": "things to do in boston - Google",
            "data": {
                "category": "page",
                "url": "https://www.google.com/?q=things+to+do+in+boston",
                "visited_date": "Sun, Oct 23",
                "visited_time": "12:03am"
            },
            "children": []
        }]
    }
    //end
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
    var ht = new $jit.Hypertree({
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
		  stylesHover: true
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
			  console.log(node.name + ": " + node.data.category)
			  node.setData("color","#dfb");
			  node.setData("type", "ellipse")
		  } else if (node.data.category == "page") {
			  node.setData("color","#fdb");
		  }
	  },
      //Attach event handlers and add text to the
      //labels. This method is only triggered on label
      //creation
      onCreateLabel: function(domElement, node){
          var lblhtml = "<div>" + node.name + "</div>";
          // console.log(node.data.category)
          if (node.data.category == "tag") {
                        console.log(node.getPos())
          } else if (node.data.category == "page") {
                        console.log(node.getData("dim"))
                        lblhtml += "<img src='img/thumb-google.png' width='" + node.getData("dim")*2 + "em' height='" + node.getData("dim")*2 + "em'></img>"
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
              console.log(node.getSubnodes())
			  ht.graph.addAdjacence(node, {'id':'bholt', 'name':'Brandon', 'data':{'category':'page'}});
			  ht.graph.addAdjacence(node, {'id':'ryscheng', 'name':'Ray', 'data':{'category':'page'}});
              ht.graph.computeLevels("root");
              ht.refresh(true);
              ht.onClick(node.id, {
                  onComplete: function() {
                      ht.controller.onComplete();
                  }
              });
          });
      },
      //Change node styles when labels are placed
      //or moved.
      onPlaceLabel: function(domElement, node){
          var style = domElement.style;
          style.display = '';
          style.cursor = 'pointer';
		  style.backgroundColor = "#D2D2D2";
          if (node._depth == 0) {
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
          var node = ht.graph.getClosestNodeToOrigin("current");
          console.log(node)
        
          var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
          html += "<ul>";
          node.eachAdjacency(function(adj){
              var child = adj.nodeTo;
              if (child.data) {
                  var rel = (child.data.band == node.name) ? child.data.relation : node.data.relation;
                  html += "<li>" + child.name + " " + "<div class=\"relation\">(relation: " + rel + ")</div></li>";
              }
          });
          html += "</ul>";
          $jit.id('inner-details').innerHTML = html;
      }
    });
    //load JSON data.
    ht.loadJSON(json);
    //compute positions and plot.
    ht.refresh();
    //end
    ht.controller.onComplete();
}

window.onload = init;

function rayPrint(msg) {
  console.log("RAY SENDS:"+msg);
}
