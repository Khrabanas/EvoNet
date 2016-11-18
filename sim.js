var canvas = geid('canvas');
var ctx = canvas.getContext('2d');

//get id, so I can easily make a ui.
function geid(id) {
  return document.getElementById(id);
}
//WILL later change to a PRNG //done
var seed = 1;
var xorRandom = Xor4096(1);
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
//    B
//
//C   +   A (head/forward direction)=>>>
//
//    D
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
    pop[i] = makeNet(i, rand()*canvas.width, rand()*canvas.height);
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
    up:{value:0},
    down:{value:0},
    left:{value:0},
    right:{value:0},
};
var outputStore = {
    rot:{},
    speed:{},
};
//this function sets the parameters of a neural network. For instance: Do I want 3 hidden nodes and 2 layers, or maybe 2 hidden nodes and 6 layers?
//the for/in statement thingy is taken from Andreas Grech's answer on http://stackoverflow.com/questions/684672/how-do-i-loop-through-or-enumerate-a-javascript-object
function buildNet(hnCount, hlCount) {
  var nn = {}; //new net
  nn.hLayers = {};
  nn.inputs = inputStore;
  nn.outputs = outputStore;
  for(var i = 0; i<hlCount; i++ ) {
    nn.hLayers["layer"+i] = {layerNumber:i};
    for (var j = 0; j < hnCount; j++) {
      nn.hLayers["layer" + i]["node"+j] = {nodeNumber:j};
    }
  }
  for(var input in nn.inputs) {
    if (!nn.inputs.hasOwnProperty(input)){continue;}
    //probably don't need to store this twice, but it does not matter much. not fully optimised, but clearer and easier to read and work with.
    nn.inputs[input] = nn.hLayers;
    //input is a,b,c,d.
    //layer is layer1,layer2, etc.
    //node is node0,node3, etc
    //so, accessing the lowest axon of the inputs is: "nn.inputs.a.layer0.node0.axon"

    for(var layer in nn.inputs[input]) {
      if (!nn.inputs[input].hasOwnProperty(layer)){continue;}

      for(var node in nn.inputs[input][layer]) {
        if (!nn.inputs[input][layer].hasOwnProperty(node)){continue;}
        nn.inputs[input][layer][node].axon = pnrand();

      }
    }
  }
  nn.axons = nn.hLayers;
  for(var axonLayer in nn.axons) {
        if (!nn.axons.hasOwnProperty(axonLayer)){continue;}
        for(var axonNode in nn.axons[axonLayer]) {
          if (!nn.axons[axonLayer]hasOwnProperty(axonNode)){continue;}
          //the split
            for(var nextLayer in nn.hLayers) {
                if (!nn.hLayers.hasOwnProperty(nextLayer) && nextLayer.layerNumber <= axon.layerNumber) {continue;}
              nn.axons[axonLayer][axonNode][nextLayer] = {};
              
              for (var nextNode in nn.hLayers[nextLayer]) {
                    if (!nn.hLayers[nextLayer].hasOwnProperty(nextNode)) {continue;}
                nn.axons[axonLayer][axonNode][nextLayer][nextNode] = pnrand();
                  
       
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
function readNet(net) {
    for(var layer in nn.hLayers) {
        if (!nn.inputs.hasOwnProperty(input)) {continue;}
        for(var node in nn.hLayers[layer]) {
            //the split between the node it goes to^ and the node it comes from \/
            
            var sum = 0;
            //lines leading from inputs to node.
            for (var input in nn.inputs){
                var test = 1;
            }
            
            for(var prevLayer in nn.hLayers) {
                if (!nn.hLayers.hasOwnProperty(prevLayer) && prevLayer.layerNumber >= layer.layerNumber) {continue;}
                for (var prevNode in nn.hLayers[prevLayer]) {
                    if (!nn.hLayers[prevLayer].hasOwnProperty(prevNode)) {continue;}
                    sum += nn.inputs[hLayers][prevLayer][prevNode].axon * nn.hLayers[]
                }
            }
            nn.hLayers[layer][node]["value"] =
        }
        
    }
    nn.hLayers["layer"+i];
    for (var j = 0; j < hnCount; j++) {
      nn.hLayers["layer" + i]["node"+j] = {};
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
