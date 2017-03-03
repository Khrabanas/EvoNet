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
//this function clones an array or object.
function deepClone(a) {
  return JSON.parse(JSON.stringify(a));
}
var worldW = 1000;
var worldH = 1000;
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
  for (var i = 0; i < popCount; i++) {
    pop[i] = makeOrg(4, 3, i, rand()*worldW, rand()*worldH, rand()*2*Math.PI, 30, newGenes(), 0);
  }
}

var plants = [];
function newHabitat(plantCount) {
  plants = [];
  for (var i=0; i<plantCount;i++ ){
    makePlant(i, 25*rand(), rand()*canvas.width, rand()*canvas.height);
  }
}

//just does what it does
function poputat(popCount) {
  newPop(popCount);
  newHabitat(Math.round(popCount*2));
}
function makePlant(arrayPos, cal, x, y) {
  plants[arrayPos] = {
	cal:cal,
	x:x,
	y:y,
	index:arrayPos,
  };
}


//merely iterates at some amount of time. 1000 = 1 second per iteration.
var running = false;
var time = null;
function run(msecs) {
	if (running){
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

function newGenes(){
  return {
    syn:{},
    attr:{},
  };
}

function findSyn(genes, sid) {
  var v = genes.syn[sid];
  if (v != null) {
    return v;
  }
  v = pnrand();
  genes.syn[sid] = v;
  return v;
}
function findAttr(genes, aid){
  var v = genes.attr[aid];
  if (v != null) {
    return v;
  }
  v = rand();
  genes.attr[aid] = v;
  return v;
}
function setAttr(genes, aid, value) {
  var v = genes.attr[aid];
  if (v != null) {
    return v;
  }
  v = value;
  genes.attr[aid] = v;
  return v;
}
//inputs and outputs are the two arrays that will be manually edited for now. they set the inputs and outputs.
var inputStore = {
    //eLL1 = eyeLineLeftnumber1, eLRight2 etc.
    eLR0:{value:-1},
    eLR1:{value:-1},
    eLR2:{value:-1},
    eLR3:{value:-1},
    eLR4:{value:-1},

    eLL0:{value:-1},
    eLL1:{value:-1},
    eLL2:{value:-1},
    eLL3:{value:-1},
    eLL4:{value:-1},

    //same for plants; planteyeLineLeftnumber1
    peLR0:{value:-1},
    peLR1:{value:-1},
    peLR2:{value:-1},
    peLR3:{value:-1},
    peLR4:{value:-1},

    peLL0:{value:-1},
    peLL1:{value:-1},
    peLL2:{value:-1},
    peLL3:{value:-1},
    peLL4:{value:-1},
};
var outputStore = {
    rot:{value:0},
    speed:{value:0},
    eat:{value:0},
    mate:{value:0},
};
//nn.outputs[output].value

//this function sets the parameters of a neural network. For instance: Do I want 3 hidden nodes and 2 layers, or maybe 2 hidden nodes and 6 layers?
//How it should work:

//nn.inputs contains the input values as well as the synapses leading from them to the nodes and outputs.
//nn.synapses is specifically for the synapses leading from the hidden nodes to the other hidden nodes and the ouputs.
//nn.hLayers is the simple structure of the neural network, as well as the values for the nodes. No synapses should be stored here.
function buildNet(hnCount, hlCount, genes) {
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
      var sid = input + " " + output;
			nn.inputs[input][output] = {synapse: findSyn(genes, sid)};
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
        var sid = input+" "+layer+" "+node;

				nn.inputs[input][layer][node].synapse = findSyn(genes, sid);
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
            var sid = synapseLayer+" "+synapseNode+" "+nextLayer+" "+nextNode;
				    nn.synapses[synapseLayer][synapseNode][nextLayer][nextNode].value = findSyn(genes, sid);


				}
			}
			nn.synapses[synapseLayer][synapseNode].outputs = {};
			for (var outputSynapse in nn.outputs) {
				if (!nn.outputs.hasOwnProperty(outputSynapse)) {
					continue;
				}
        var sid = synapseLayer+" "+synapseNode+" "+outputSynapse;
				nn.synapses[synapseLayer][synapseNode].outputs[outputSynapse] = {
					synapse: findSyn(genes, sid)
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

function decideGender(genes) {
    if (findAttr(genes, "gender") < 0.5) {
        return 'male';
    } else {
        return 'female';
    }
}

function getColor(genes){
    //value from 0 to 1
    var value = findAttr(genes, "color");
    var hue = ((1-value)*360).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

//makeOrg(4, 3, i, rand()*worldW, rand()*worldH, rand()*2*Math.PI, 30, genes, 0)
function makeOrg(hnCount, hlCount, netHome, x, y, rot, health, genes, gen) {
    var org = {};
    org.index = netHome;
    org.gen = gen;
    org.x = x;
    org.y = y;
    org.rot = rot;
    org.health = health;
    org.hnCount = hnCount;
    org.hlCount = hlCount;
    org.mated = false;
    org.nn = buildNet(hnCount, hlCount, genes);
    readNet(org.nn);
    //morphology
    org.morph = {};
    org.morph.color = getColor(genes);
    org.morph.gender = decideGender(genes);
    //pos is an angle.
    org.morph.eye = {};
    org.morph.eyePos = findAttr(genes, "eyePos")*Math.PI/2;
    org.radius = setAttr(genes, "radius", 15);
    org.morph.eyeRes = setAttr(genes, "eyeRes", 5);
    //eye resolution, how manny sightlines
    //current values not associated directly with other stuff like nn or morph.
    //in relation to center of head
    org.morph.eye.breadth = findAttr(genes, "eyeBreadth")*Math.PI;
    org.morph.eye.range = setAttr(genes, "eyeRange", 150);
    org.morph.eye.pos = {};
    getEyes(org);
    org.genes = genes;
    //in relation to eye.
    return org;
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
        if (k == org.index || pop[k] == null) {
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

//for plants; better ways to prgram and all but I just want it to work and make sense. Above function for plants only.
function checkEyePlants(org, eye) {
  var eyeInput;
    if(eye == "r") {
        eyeInput = "peLR";
    }else if(eye == "l") {
        eyeInput = "peLL"
    } else {
        throw "Invalid eye asked for; use l (left) or r (right) for the checkEye function.";
        return;
    }

    for (var j = 0; j < org.morph.eyeRes; j++) {
        org.nn.inputs[eyeInput + j].value = -1;
    }

    for (var k = 0; k < plants.length; k++) {
        if (plants[k] == null) {
            continue; //no null plant
        }
        var target = plants[k];
        //eye distance is distance between eye and the radius center of another organism.
        var eyeDis = Math.sqrt(findDis(org.morph.eye.pos[eye].x, org.morph.eye.pos[eye].y, target.x, target.y));
        if (eyeDis > target.cal + org.morph.eye.range) {
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
              org.morph.eye.pos[eye][j].x, org.morph.eye.pos[eye][j].y, target.x, target.y, target.cal);
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
    if(lineAnswer) {
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
    for(var i = 0; i < plants.length; i++) {
        var p = plants[i];
        circle(p.x, p.y, p.cal, "green")
        ctx.fillText(Math.round(100*p.cal)/100, p.x - p.cal/2, p.y + p.cal/2);
    }
    for(var i = 0; i < pop.length; i++) {
        var org = pop[i];
        if (org == null) {
          continue;
        }
        circle(org.x, org.y, org.radius, org.morph.color);
        ctx.fillText(i, org.x - org.radius/2, org.y + org.radius/2);

        for(var j = 0; j < org.morph.eyeRes; j++){
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

function eat(org, plant) {
    if(plant.cal <= 1) {
        makePlant(plant.index, 25*rand(), rand()*canvas.width, rand()*canvas.height);
        //console.log("plant #"+plant.index+ " has died")
    }
    //10 is a nutrition modifier; should be changed.
    if(findDis(org.x,org.y,plant.x,plant.y)<(org.radius+plant.cal)*(org.radius+plant.cal) && org.nn.outputs.eat.value > 0) {
        plant.cal -= org.nn.outputs.eat.value;
        org.health += org.nn.outputs.eat.value * 10;
        //console.log(org.index + " gained " + org.nn.outputs.eat.value*10 + " and plant #" +plant.index+" lost " + org.nn.outputs.eat.value+" and is now "+ plant.cal);
    }
}

function birth(orgF, orgM) {
  var i = 0;
  var bits = [];
  var mutationRate = 0.01;
  var newGenes = deepClone(orgF.genes);
  for (var x in newGenes.syn) {
    bits[i++] = {val:false, gene:x};
  }
  for (var i = bits.length/2; i > 0; i--) { //what if it runs over the same gene twice or more?
    for(;;) {
      var j = Math.floor(bits.length*rand());
      if (bits[j].val) {
        continue
      }
      bits[j].val = true;
      newGenes.syn[bits[j].gene] = orgM.genes.syn[bits[j].gene];
      break;
    }
  }
  for (var i = 0; i < bits.length; i++) {
    if(rand()>mutationRate) {
      continue;
    }
    newGenes.syn[bits[i].gene] = pnrand();
  }
  
  orgF.health -= 10;
  var childHealth = orgF.health/2
  orgF.health /= 2;
  var newHome;
  for(var i = 0;; i++) {
    if(pop[i] == null) {
       newHome = i;
       break;
    }
  }
  var newGen;
  if(orgF.gen > orgM.gen) {
    newGen = orgF.gen + 1;
  } else {
    newGen = orgM.gen + 1;
  }
    children[newHome] = makeOrg(orgF.hnCount, orgF.hlCount, newHome, orgF.x, orgF.y, orgF.rot, childHealth, newGenes, newGen);
    console.log("pop["+newHome+"] was born or "+ orgF.index +"and "+ orgM.index);
}
var children = [];

function iterate() {
  //for (var j = 0; j < 1; j++) {
    for (var i = 0; i < pop.length; i++) {
      var org = pop[i];
      if (org == null) {
        continue;
      }
      checkEye(org, "r");
      checkEye(org, "l");
      checkEyePlants(org, "r");
      checkEyePlants(org, "l");
      readNet(org.nn);
      //mating
      if(org.nn.outputs.mate.value > 0 && org.mated == false) {
          for(var k = 0; k < pop.length; k++) {
              if(pop[k] == null || findDis(pop[k].x,pop[k].y,org.x,org.y) > (pop[k].radius + org.radius)*(pop[k].radius + org.radius)) {
                  continue;
              }
              //if they are the different genders, k does not want to mate, k has already mated, k is the same as org, then skip.
              if(org.morph.gender == pop[k].morph.gender || pop[k].nn.outputs.mate.value < 0 || k.mated == true || org.index == pop[k].index) {
                  continue;
              }
              var orgF, orgM;
              if(org.morph.gender == "male") {
                  orgM = org;
                  orgF = pop[k];
              } else {
                  orgF = org;
                  orgM = pop[k];

              }
              birth(orgF, orgM);
              org.mated = true;
              pop[k].mated = true;

              break;
          }
      }
    }
    
    for(var i = 0; i < children.length; i++) {
        if(children[i]!=null) {
            pop[i] = deepClone(children[i]);
            children[i] = null;
        }
    }
    for (var i = 0; i < pop.length; i++) {
      var org = pop[i];
      if (org == null) {
        continue;
      }
      if(1==1) {//actual requirements here plz
          org.mated = false;
      }
      for(var l = 0; l < plants.length; l++){
        eat(org, plants[l]);
      }
      if (org.health > 200) {
          org.health = 200;
      }
      org.rot += org.nn.outputs.rot.value;
      org.x += Math.cos(org.rot) * org.nn.outputs.speed.value*maxspeed;
      if (org.x > worldW) {
        org.x -= worldW;
      } else if (org.x < 0) {
        org.x += worldW;
      }
      org.y -= Math.sin(org.rot) * org.nn.outputs.speed.value*maxspeed;
      if (org.y > worldH) {
        org.y -= worldH;
      } else if (org.y < 0) {
        org.y += worldH;
      }
      getEyes(org);
      org.health -= Math.abs(org.nn.outputs.speed.value);
      if (org.health <= 0) {
        console.log("death of " + org.index);
        pop[i] = null;
      }
    
    
    }
  //}
  iterations++;
  if (true) {
    render();
  }
}

var rendering = false;

function findDis(x1,y1,x2,y2) {
  return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
  //requires a Math.sqrt to get actual value.
}
