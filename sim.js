// idk why I am putting this here but this a very useful resource for later use http://marinepalaeoecology.org/wp-content/uploads/2016/11/Scheffers_at_al_CC_impacts_Science_2016.pdf
var canvas = geid('canvas');
var ctx = canvas.getContext('2d');

//get id, so I can easily make a ui when I need to.
function geid(id) {
  return document.getElementById(id);
}
//WILL later change to a PRNG //done
var seed = 1;
var xorRandom = xor4096(seed);
//xorshift is alower by a bit than Math.random()
function rand() {
//  return Math.random();
// ^ this is using javascript random, which is not seedable and will not let me have a determinate universe.
return xorRandom();
}
// pos/neg random, used for NN connections.
function pnrand() {
	return rand()*2 - 1;
}
//this function clones an array or object or whatever, so do not say theArrayIWant.somePartOfIt = otherArray, instead have theArrayIWant.somePartOfIt = deepClone(otherArray)
function deepClone(a) {
  return JSON.parse(JSON.stringify(a));
}
worldW = 1000;
worldH = 1000;
canvas.width = worldW;
canvas.height = worldH;
ctx.font = "10px Arial";

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
//new population.
//pretty self explanatory.
var pop = [];

//eventually i will add arguments to this function (hnCount, hlCount, popCount), etc.
function newPop(popCount) {
    pop = [];
    //clearCanvas();

    for (var i = 0; i < popCount; i++) {
        pop[i] = makeOrg(4, 3, decideGender(), rand(), i, rand() * worldW, rand() * worldH, rand() * 2 * Math.PI, rand() * Math.PI, rand() * Math.PI / 2, rand() * Math.PI, 100, 10, 10);
        //ctx.fillStyle="rgb("+2.55*pop[i].diet + ",0," + 255/pop[i].diet + ")";
        //ctx.fillText(i,pop[i].xPos,pop[i].yPos);
    }

}

var plants = [];
function newHabitat(plantCount) {
  plants = [];
  for (var i=0; i<plantCount;i++ ){
	makePlant(i, 10, rand()*canvas.width, rand()*canvas.height);
  }

}
//just does what it does
function poputat(popCount) {
  newPop(popCount);
  newHabitat(Math.round(popCount/2));
}
function makePlant(arrayPos, cal, posX, posY) {
  plants[arrayPos] = {
	cal:cal,
	posX:posX,
	posY:posY,

  };
}
//eye configuration should be this. labeled this way so that A syncs up with 0rad (B with PI/2, etc).
//	B
//
//C   +   A (head/forward direction)=>>>
//
//	D
//I need to turn up down left right into a b c d. MUUUCH LESS CONFUSING.

//merely iterates at some amount of time. 1000 = 1 second per iteration.
var running = false;
var time = null;
function run(msecs) {
	if (running === true){
		console.log("Error in function: 'run', Time is already passing, use stop and run again.");
		return;
	}
	time = setInterval(iterate, msecs);
	running = true;
}
function stop() {
  if (time != null) {
    clearInterval(time);
    time = null;
  }
  running = false;
}
//each step of the simulation is contained in an iteration.

//inputs and outputs are the two arrays that will be manually edited for now. they set the inputs and outputs.
var inputStore = {
  //eLL1 = eyeLineLeftnumber1, eLRight2 etc.
  eLR0:{value:pnrand()},
	eLR1:{value:pnrand()},
	eLR2:{value:pnrand()},
	eLR3:{value:pnrand()},
	eLR4:{value:pnrand()},

  eLL0:{value:pnrand()},
	eLL1:{value:pnrand()},
	eLL2:{value:pnrand()},
	eLL3:{value:pnrand()},
	eLL4:{value:pnrand()},
};
var outputStore = {
	rot:{value:0},
	speed:{value:0},
};
//nn.outputs[output].value

//this function sets the parameters of a neural network. For instance: Do I want 3 hidden nodes and 2 layers, or maybe 2 hidden nodes and 6 layers?
//How it should work:

//nn.inputs contains the input values as well as the synapses leading from them to the nodes and outputs.
//nn.synapses is specifically for the synapses leading from the hidden nodes to the other hidden nodes and the ouputs.
//nn.hLayers is the simple structure of the neural network, as well as the values for the nodes. No synapses should be stored here.
function buildNet(hnCount, hlCount) {
	var nn = {}; //new net
	nn.hLayers = {};
	nn.inputs = deepClone(inputStore);
	nn.outputs = deepClone(outputStore);
	var inputLength = Object.keys(inputStore).length;
	nn.hLayers.totalNumberOfNodes = hnCount*hlCount + inputLength;
	for (var i = 0; i < hlCount; i++) {
	  var lID = "layer"+i;
		nn.hLayers[lID] = {
			layerNumber: i,
			numOfPrevNodes: i * hnCount + inputLength,
		};
		for (var j = 0; j < hnCount; j++) {
		  var nID = "node"+j;
			nn.hLayers[lID][nID] = {
				nodeNumber: j,
				value:0 //this is merely the start value. it will change everytime it updates.
			};
		}
	}
	for (var input in nn.inputs) {
		if (!nn.inputs.hasOwnProperty(input)) {
			continue;
		}
		//probably don't need to store this multiple times, but it does not matter much. not fully optimised, but clearer and easier to read and work with.
		nn.inputs[input] = deepClone(nn.hLayers);
		nn.inputs[input].value = inputStore[input].value;

		for(var output in nn.outputs) {
			if (!nn.outputs.hasOwnProperty(output)) {
				continue;
			}
			nn.inputs[input][output] = {synapse:pnrand()};

		}
		//input is a,b,c,d.
		//layer is layer1,layer2, etc.
		//node is node0,node3, etc
		//so, accessing the lowest synapse of the inputs is: "nn.inputs.a.layer0.node0.synapse"

		for (var layer in nn.inputs[input]) {
			if (!nn.inputs[input].hasOwnProperty(layer)) {
				continue;
			}

			for (var node in nn.inputs[input][layer]) {
				if (!nn.inputs[input][layer].hasOwnProperty(node)) {
					continue;
				}
				nn.inputs[input][layer][node].synapse = pnrand();

			}
		}
	}

	nn.synapses = deepClone(nn.hLayers);
	for (var synapseLayer in nn.synapses) {
		if (!nn.synapses.hasOwnProperty(synapseLayer)) {
			continue;
		}
		for (var synapseNode in nn.synapses[synapseLayer]) {
			if (!nn.synapses[synapseLayer].hasOwnProperty(synapseNode) || typeof(nn.synapses[synapseLayer][synapseNode]) == "number") {

				continue;
			}

			nn.synapses[synapseLayer][synapseNode] = deepClone(nn.hLayers);
				//the split
			//makes output synapses leading from the node.



			for (var nextLayer in nn.synapses[synapseLayer][synapseNode]) {
				if (!nn.hLayers.hasOwnProperty(nextLayer) || nn.synapses[synapseLayer][synapseNode][nextLayer].layerNumber <= nn.synapses[synapseLayer].layerNumber) {

					delete nn.synapses[synapseLayer][synapseNode][nextLayer];

					continue;
				}

				for (var nextNode in nn.synapses[synapseLayer][synapseNode][nextLayer]) {
				    if (!nn.synapses[synapseLayer][synapseNode][nextLayer].hasOwnProperty(nextNode)) {
				        continue;
				    }

				    nn.synapses[synapseLayer][synapseNode][nextLayer][nextNode].value = pnrand();


				}
			}
			nn.synapses[synapseLayer][synapseNode].outputs = {};
			for (var outputSynapse in nn.outputs) {
				if (!nn.outputs.hasOwnProperty(outputSynapse)) {
					continue;
				}
				nn.synapses[synapseLayer][synapseNode].outputs[outputSynapse] = {
					synapse: pnrand()
				};
			}
		}
	}

	return nn;
}


//a network thinking.
function readNet(nn) {
	for(var layer in nn.hLayers) {
		if (!nn.hLayers.hasOwnProperty(layer) || typeof(nn.hLayers[layer].layerNumber) !== "number") {
			continue;
		}
    var thisLayer = nn.hLayers[layer];
		for(var node in thisLayer) {
			if (!thisLayer.hasOwnProperty(node) || typeof(thisLayer[node].nodeNumber) !== "number" ) {
				continue;
			}
			thisLayer[node].value = 0;  // reset value before adding input signals

      var weight = 1.0/thisLayer.numOfPrevNodes;
			for (var input in nn.inputs){
			  if (!nn.inputs.hasOwnProperty(input)) {
			    continue;
			  }
        var thisInput = nn.inputs[input];
			  thisLayer[node].value += weight*(thisInput[layer][node].synapse * thisInput.value);
			}

      var layerNum = thisLayer.layerNumber;
			for (var prevLayer in nn.hLayers) {
		    if (!nn.hLayers.hasOwnProperty(prevLayer) || typeof(nn.hLayers[prevLayer].layerNumber) !== "number" || layerNum <= nn.hLayers[prevLayer].layerNumber) {
		      continue; // not a previous layer.
		    }
		    for (var prevNode in nn.hLayers[prevLayer]) {
		      if (!nn.hLayers[prevLayer].hasOwnProperty(prevNode) || typeof(nn.hLayers[prevLayer][prevNode].nodeNumber) !== "number") {
				    continue;
			    }
			    thisLayer[node].value += weight*(nn.synapses[prevLayer][prevNode][layer][node].value * nn.hLayers[prevLayer][prevNode].value);
        }
			}
		}
	}
  var weight = 1.0/nn.hLayers.totalNumberOfNodes;
  for (var output in nn.outputs) {
    if (!nn.outputs.hasOwnProperty(output)) {
      continue;
    }
    nn.outputs[output].value = 0;
    for (var inputOut in nn.inputs) {
      if (!nn.inputs.hasOwnProperty(inputOut)) {
        continue;
      }
      nn.outputs[output].value += weight*(nn.inputs[inputOut][output].synapse * nn.inputs[inputOut].value);
    }

    for (var layerOut in nn.hLayers) {
      if (!nn.hLayers.hasOwnProperty(layerOut) || typeof(nn.hLayers[layerOut].layerNumber) == "number") {
        continue;
      }
      for (var nodeOut in nn.hLayers[layerOut]){
        if (!nn.hLayers[layerOut].hasOwnProperty(nodeOut) || typeof(nn.hLayers[layerOut][nodeOut].nodeNumber) == "number") {
          continue;
        }
        nn.outputs[output].value += weight*(nn.hLayers[layerOut][nodeOut].value * nn.synapses[layerOut][nodeOut].ouputs[output].synapse);
      }
    }
  }
}

function decideGender() {
    if (rand() < 0.5) {
        return 'male';
    } else {
        return 'female';
    }
}

function getColor(value){
    //value from 0 to 1
    var hue = ((1-value)*360).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}


//makeOrg(4, 3, decideGender(), rand(), i, rand()*worldW, rand()*worldH, rand()*2*Math.PI, rand()*Math.PI/2, rand()*Math.PI/2, rand()*Math.PI, 50, 10, 10) eyePos and breadth should be only positive, position is 0-90 degrees, breadth is 0-180. eye rotation is the rotation of the eye in its position, 0-90 degrees.
function makeOrg(hnCount, hlCount, gender, color, netHome, x, y, rot, eyePos, eyeRot, eyeBreadth, eyeRange, health, hunger) {
    var org = {};
    org.index = netHome;
    org.x = x;
    org.y = y;
    org.rot = rot;
    org.nn = buildNet(hnCount, hlCount);
    readNet(org.nn);
    //morphology
    org.morph = {};
    org.morph.colorGene = color;
    org.morph.color = getColor(color);
    org.morph.gender = gender;
    //pos is an angle.
    org.morph.eye = {};
    org.morph.eyePos = eyePos;
    org.morph.eyeRot = eyeRot;
    org.radius = 10;
    org.morph.eyeRes = 5;
    //eye resolution, how manny sightlines
    //todo: _____!!!! think about body shape, should it differ with age/health?
    //current values not associated directly with other stuff like nn or morph.
    org.health = health;
    org.hunger = hunger;
    //high hunger values good, there will be a max.possibly overeating.
    //in relation to center of head
    org.morph.eye.breadth = eyeBreadth;
    org.morph.eye.pos = {};
    org.morph.eye.range = eyeRange;
    getEyes(org);
    //in relation to eye.
    return org;
}
function mutate(org) {
    //0.02 is my arbitrary mutation rate
    for(var input in org.nn.inputs) {
        if(typeof(org.nn.inputs[input]) == "number") {
            continue;
        }

        for(var inTo in org.nn.inputs[input]) {
            if(inTo != "synapse" && typeof(org.nn.inputs[input][inTo] != "number") ) {
                for(var toNode in org.nn.inputs[input][inTo]){
                    if(typeof(org.nn.inputs[input][inTo][toNode]) == "number") {
                        continue;
                    } else if (rand() < 0.02) {
                        org.nn.inputs[input][inTo][toNode].synapse = rand();
                        console.log("mutate")
                    }
                }
                continue;
            }
            if (rand() < 0.02) {
                org.nn.inputs[input].synapse = rand();
                console.log("mutation")
            } else {
                continue;
            }


        }
    }
}
function checkEye(org, eye) {
  var eyeInput;
    if(eye == "r") {
        eyeInput = "eLR";
    }else if(eye == "l") {
        eyeInput = "eLL"
    } else {
        throw "Invalid eye asked for; use l (left) or r (right) for the checkEye function.";
        return;
    }

    for (var j = 0; j < org.morph.eyeRes; j++) {
        org.nn.inputs[eyeInput + j].value = -1;
    }

    for (var k = 0; k < pop.length; k++) {
        if (k == org.index) {
            continue; //do not look at self
        }
        var target = pop[k];
        //eye distance is distance between eye and the radius center of another organism.
        var eyeDis = Math.sqrt(findDis(org.morph.eye.pos[eye].x, org.morph.eye.pos[eye].y, target.x, target.y));
        if (eyeDis > target.r + org.morph.eye.range) {
          continue; //target out of range.
        } else if (eyeDis < target.r) {
          for (var j = 0; j < org.morph.eyeRes; j++) {
            org.nn.inputs[eyeInput + j].value = 1;
          }
          break; //eye is on top of a target.
        }

        for (var j = 0; j < org.morph.eyeRes; j++) {
          if (org.nn.inputs[eyeInput + j].value == 1) {
            continue;
          }
          org.nn.inputs[eyeInput + j].value = lineToPulse(org.morph.eye.pos[eye].x, org.morph.eye.pos[eye].y,
              org.morph.eye.pos[eye][j].x, org.morph.eye.pos[eye][j].y, target.x, target.y, target.radius);
        }
    }
}

//lineToPulse(pop[90].morph.eye.pos.r.x, pop[90].morph.eye.pos.r.y, pop[90].morph.eye.pos.r[2].x, pop[90].morph.eye.pos.r[2].y, pop[99].x, pop[99].y, pop[99].radius);
function lineCircle(x1, y1, x2, y2, x3, y3, r) {
  var r2 = r*r;
  //is either end point inside the circle
  var dx1 = x1 - x3;
  var dy1 = y1 - y3;
  if (r2>=dx1*dx1 + dy1*dy1) {
    return true;
  }
  var dx2 = x2 - x3;
  var dy2 = y2 - y3;
  if (r2>=dx2*dx2 + dy2*dy2) {
    return true;
  }
//discover (xc, yc) which is the point of closest approah of line to center of circle.
  var xc;
  var yc;
  if (x1 == x2) {
  //special case of vertical line
    xc = x1;
    yc = y3;
  } else {
    var m12 = (y2-y1)/(x2-x1);
    var c12 = (x1*y2-y1*x2)/(x1-x2);
    var c3 = y3+x3/m12;
    xc = m12*(c3-c12)/(1+m12*m12);
    yc = m12*xc+c12;
  }
//determine if (xc, yc) is between (x1, y1) and and (x2, y2)
  if (Math.abs(x1-x2) > Math.abs(y1-y2)) {
    if (!((xc >= x1 && xc <= x2) || (xc >= x2 && xc <= x1))) {
      return false;
    }
  } else {
    if (!((yc >= y1 && yc <= y2) || (yc >= y2 && yc <= y1))) {
      return false;
    }
  }
//determine if (xc, yc) is within circle of radius r and centered (x3, y3)
  var dx = xc - x3;
  var dy = yc - y3;
  return (r2 >= dx*dx + dy*dy);
}


function lineToPulse(x1, y1, x2, y2, x3, y3, r) {
  var lineAnswer = lineCircle(x1, y1, x2, y2, x3, y3, r);
    if(lineAnswer == true) {
        return 1;
    } else {
        return -1;
    }
}






function getEyes(org){ //working on this right now.

    //center coords are org.x and org.y
    org.morph.eye.pos.r = {
        x: org.x + Math.cos(org.rot - org.morph.eyePos)*org.radius,
        y: org.y - Math.sin(org.rot - org.morph.eyePos)*org.radius,
    }
    org.morph.eye.pos.l = {
        x: org.x + Math.cos(org.rot + org.morph.eyePos)*org.radius,
        y: org.y - Math.sin(org.rot + org.morph.eyePos)*org.radius,
    }
    //get sight line end points
    for(var i=0; i < org.morph.eyeRes; i++) {
        //r = right eye, l is left...
        //these should be point, so that a line can be drawn from the eye to the point as a sight-line.
        var offset = org.morph.eye.breadth/2 - i*org.morph.eye.breadth/org.morph.eyeRes
        org.morph.eye.pos.r[i] = {
            x: org.morph.eye.pos.r.x + Math.cos(org.rot - offset) * org.morph.eye.range,
            y: org.morph.eye.pos.r.y - Math.sin(org.rot - offset) * org.morph.eye.range,
        }
        org.morph.eye.pos.l[i] = {

            x: org.morph.eye.pos.l.x + Math.cos(org.rot + offset) * org.morph.eye.range,
            y: org.morph.eye.pos.l.y - Math.sin(org.rot + offset) * org.morph.eye.range,

        }
    }
}
//render should not cause any change, just render the scenario. use iterate for
function render() {
    clearCanvas();
    for(var i = 0; i < pop.length; i++) {
        var org = pop[i];

        circle(org.x, org.y, org.radius, org.morph.color);
        ctx.fillText(i, org.x - org.radius/2, org.y + org.radius/2);
        for(var j = 0; j < org.morph.eyeRes; j++){

            //console.log(org.morph.eye.pos.r.x);
          //  console.log(org.morph.eye.pos.r.x);

            line(org.morph.eye.pos.r.x, org.morph.eye.pos.r.y, org.morph.eye.pos.r[j].x, org.morph.eye.pos.r[j].y);

            line(org.morph.eye.pos.l.x, org.morph.eye.pos.l.y, org.morph.eye.pos.l[j].x, org.morph.eye.pos.l[j].y);
        }
   }
}
function line(startX, startY, endX, endY) {

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function circle(centerX, centerY, radius, color, width) {
    ctx.beginPath();

    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = color;
    if (width != undefined) {
        ctx.lineWidth = width;
    } else {
        ctx.lineWidth = 1;
    }
    ctx.stroke();
}
var iterations = 0;
var maxspeed = 100;
function iterate() {
  for (var j = 0; j < 1; j++) {
    for (var i = 0; i < pop.length; i++) {
      checkEye(pop[i], "r");
      checkEye(pop[i], "l");
      readNet(pop[i].nn);
    }
    for (var i = 0; i < pop.length; i++) {
      pop[i].rot += pop[i].nn.outputs.rot.value;
      pop[i].x += Math.cos(pop[i].rot) * pop[i].nn.outputs.speed.value*maxspeed;
      pop[i].y -= Math.sin(pop[i].rot) * pop[i].nn.outputs.speed.value*maxspeed;
    }
    for (var i = 0; i < pop.length; i++) {
      getEyes(pop[i])
    }
  }
  iterations++;
  render();
}



function findDis(x1,y1,x2,y2) {
  return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
  //requires a Math.sqrt to get actual value. this can be found in the getProx function.
}
