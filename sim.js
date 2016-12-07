// idk why I am putting this here but this a very usefl resource for later use http://marinepalaeoecology.org/wp-content/uploads/2016/11/Scheffers_at_al_CC_impacts_Science_2016.pdf
var canvas = geid('canvas');
var ctx = canvas.getContext('2d');

//get id, so I can easily make a ui when I need to.
function geid(id) {
  return document.getElementById(id);
}
//WILL later change to a PRNG //done
var seed = 1;
var xorRandom = xor4096(1);
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

canvas.width=1000;
canvas.height=1000;
ctx.font = "10px Arial";

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
//new population.
//pretty self explanatory.
var pop = [];
function newPop(hnCount, hlCount, popCount) {
  pop = [];
  //clearCanvas();

  for(var i=0; i<popCount; i++){
	pop[i]=buildNet(hnCount, hlCount, i, rand()*canvas.width, rand()*canvas.height);
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

function run(msecs) {
	if (running === true){
		console.log("Error in function: 'run', Time is already passing, use stop and run again.");
		return;
	}
	time = setInterval(msecs, iterate);
	running = true;
}
function stop() {
	if (running === false) {
		console.log("Error in fuction: 'stop', Already stopped.");
	}
	clearInterval(time);
	running = false;
}
//each step of the simulation is contained in an iteration.
//PROBLEM I NEED TO FIX: Make it so that they only move after every network has analyzed the current setup.
function iterate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var i=0;i<pop.length;i++) {
	var net = pop[i];
	rotEyes(net);
	addProxes(net);

	readNet(net);

	ctx.fillStyle="rgb("+ Math.floor(2.55*net.diet) + "," + Math.floor(255/net.diet) + ",0,)";

  }
  for(i = 0; i < pop.length; i++) {

	  if (canvas.width < pop[i].xPos || 0 > pop[i].xPos || canvas.height < pop[i].yPos || 0 > pop[i].yPos) {
		  pop[i] = makeNet(i, rand() * canvas.width, rand() * canvas.height);
	  }

	  moveNet(pop[i]);
	  rotEyes(pop[i]);
	  addProxes(pop[i]);

	  ctx.fillText(i, pop[i].xPos, pop[i].yPos);
	  ctx.fillText("U", pop[i].eyeUpX, pop[i].eyeUpY);
	  ctx.fillText("D", pop[i].eyeDownX, pop[i].eyeDownY);
	  ctx.fillText("L", pop[i].eyeLeftX, pop[i].eyeLeftY);
	  ctx.fillText("R", pop[i].eyeRightX, pop[i].eyeRightY);


  }

}

//takes the "speed value" from the network and turns it into a distance traveled within my parameters.
function moveNet(net) {
	net.xPos = net.xPos - (net.speed * Math.cos(net.rot))/2;
	net.yPos = net.yPos - (net.speed * Math.sin(net.rot))/2;
}
//inputs and outputs are the two arrays that will be manually edited for now. they set the inputs and outputs.
var inputStore = {
	up:{value:pnrand()},
	down:{value:pnrand()},
	left:{value:pnrand()},
	right:{value:pnrand()},
};
var outputStore = {
	rot:{value:0},
	speed:{value:0},
};
//this function sets the parameters of a neural network. For instance: Do I want 3 hidden nodes and 2 layers, or maybe 2 hidden nodes and 6 layers?
//How it should work:

//nn.inputs contains the input values as well as the synapses leading from them to the nodes and outputs.
//nn.synapses is specifically for the synapses leading from the hidden nodes to the other hidden nodes and the ouputs.
//nn.hLayers is the simple structure of the neural network, as well as the values for the nodes. No synapses should be stored here.
function buildNet(hnCount, hlCount) {
	var nn = {}; //new net
	nn.hLayers = {};
	nn.inputs = inputStore;
	nn.outputs = outputStore;
	for (var i = 0; i < hlCount; i++) {
	  var lID = "layer"+i;
		nn.hLayers[lID] = {
			layerNumber: i
		};
		for (var j = 0; j < hnCount; j++) {
		  var nID = "node"+j;
			nn.hLayers[lID][nID] = {
				nodeNumber: j,
				value:0 //this is merely the start value. it will change eveytime it updates.
			};
		}
	}
	for (var input in nn.inputs) {
		if (!nn.inputs.hasOwnProperty(input)) {
			continue;
		}
		//probably don't need to store this multiple times, but it does not matter much. not fully optimised, but clearer and easier to read and work with.
		nn.inputs[input] = deepClone(nn.hLayers);
		nn.inputs[input].value = deepClone(inputStore[input].value);
		
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
		if (!nn.synapses.hasOwnProperty(synapseLayer)) { //the console.log's in this area are for me debugging why synapses do not fill out the anything except the first layer.
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

function makeOrganism(hnCount, hlCount, netHome, x, y, rot) {
  var org = {};
  org.x = x;
  org.y = y;
  org.rot = rot;

  org.color = 1;

  org.nn = buildNet(hnCount, hlCount);

  return org;
}
//a network thinking.
function readNet(nn) {  
	for(var layer in nn.hLayers) {
		if (!nn.hLayers.hasOwnProperty(layer)) {
			continue;
		}
		for(node in nn.hLayers[layer]) {
			if (!nn.hLayers[layer].hasOwnProperty(node)) {
				continue;
			}
		}
	}

}







//finds the placement of each of the eyes from the rot of the creature. in radians.
function rotEyes(net) {

//center x= cX
  var cX = net.xPos;
  var cY = net.yPos;
  //0
  net.eyeUpX = cX + 30*Math.cos(net.rot);
  net.eyeUpY = cY + 30*Math.sin(net.rot);
  // PI
  net.eyeDownX = cX - 30*Math.cos(net.rot);
  net.eyeDownY = cY - 30*Math.sin(net.rot);
  // PI/2
  net.eyeLeftX = cX - 30*Math.cos(net.rot + Math.PI/2);
  net.eyeLeftY = cY - 30*Math.sin(net.rot + Math.PI/2);
  // 3PI/2
  net.eyeRightX = cX - 30*Math.cos(net.rot + 3*Math.PI/2);
  net.eyeRightY = cY - 30*Math.sin(net.rot + 3*Math.PI/2);
}

function addProxes(net) {
  net.upIn = getProx(net, net.eyeUpX, net.eyeUpX);
  net.downIn = getProx(net, net.eyeDownX, net.eyeDownX);
  net.leftIn = getProx(net, net.eyeLeftX, net.eyeLeftX);
  net.rightIn = getProx(net, net.eyeRightX, net.eyeRightX);
}

function getProx(net,sPosX, sPosY) {
  var closest=Infinity;
  for(i=0;i<pop.length;i++){
	var distance = findDis(sPosX,sPosY, pop[i].xPos, pop[i].yPos);
	if (i != net && distance <= closest) {
	closest = findDis(sPosX,sPosY, pop[i].xPos,pop[i].yPos);
	}
  }

  if(Math.sqrt(closest) < 200){
	return Math.sqrt(closest);
  } else {
  return 0;
}

}


function findDis(x1,y1,x2,y2) {
  return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
  //requires a Math.sqrt to get actual value. this can be found in the getProx function.
}
