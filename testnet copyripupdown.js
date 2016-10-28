var canvas = geid('canvas');
var ctx = canvas.getContext('2d');

//get id, so I can easily make a ui.
function geid(id) {
  return document.getElementById(id);
}
//WILL later change to a PRNG

function rand() {
  return Math.random();
} // ^ this is using javascript random, which is not seedable an will not let me have a determinate universe.
//TODO Implement a fast prng
canvas.width=1000;
canvas.height=1000;
ctx.font = "10px Arial";

//new population.
//pretty self explanatory.
var pop = [];
function newPop(howMany) {
  pop = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var i=0; i<howMany; i++){
  pop[i]=makeNet(i, rand()*canvas.width,rand()*canvas.height);
  ctx.fillStyle="rgb("+2.55*pop[i].diet + ",0," + 255/pop[i].diet + ")";
  ctx.fillText(i,pop[i].xPos,pop[i].yPos);
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
//eye configuration should be this.
//    B
//
//C   +   A (head/forward direction)=>>>
//
//    D
//I need to turn up c b d into a b c d. MUUUCH LESS CONFUSING.

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
    ctx.fillText("U", pop[i].eyeaX, pop[i].eyeaY);
    ctx.fillText("D", pop[i].eyecX, pop[i].eyecY);
    ctx.fillText("L", pop[i].eyebX, pop[i].eyebY);
    ctx.fillText("R", pop[i].eyedX, pop[i].eyedY);

    
  }
  
}

//takes the "speed value" from the network and turns it into a distance traveled within my parameters.
function moveNet(net) {
    net.xPos = net.xPos - (net.speed * Math.cos(net.rot))/2;
    net.yPos = net.yPos - (net.speed * Math.sin(net.rot))/2;
}
//inputs and outputs are the two arrays that will be manually edited for now. they set the inputs and outputs.
var inputStore = {
    a,
    c,
    b,
    d,
};
var outputStore = {
    rot,
    speed,
};

//this function sets the parameters of a neural network. For instance: Do I want 3 hidden nodes and 2 layers, or maybe 2 hidden nodes and 6 layers?
//the for/in statement thingy is taken from Andreas Grech's answer on http://stackoverflow.com/questions/684672/how-do-i-loop-through-or-enumerate-a-javascript-object
function buildNet(hnCount, hlCount, netHome) {
    var nn = {}; //new net
    var hLayers = {};
        for(var i = 0; i<hlCount; i++ ) {
            hLayers["layer"+i] = {};
            for (var j = 0; j < hnCount; j++) {
                hLayers["layer" + i]["node"+j] = {};
            }
        }
    for(var input in inputStore) {
        if (!p.hasOwnProperty(input)) {
        continue;
        }
        for(var k=0;k<hLayers.length; k++){
            nn[inputWeights];
        }
//code^

    }
}

function makeEye(){
 return {rotW:rand(),
    speedW:rand(),
    h1W:rand(),
    h2W:rand(),
    h3W:rand(),
    h4W:rand()
 };
}
function makeHNode() {
 return {
   rotW:rand(),
   speedW:rand(),

 };
}
function makeNet(arrayPos,xPos,yPos) {
  return {
    
    //the input positions. they can be extrapolated directly from the rotation, but for now it is easier to store them here.
    eyeaX:null,
    eyeaY:null,
    aIn:null,
    
    eyecX:null,
    eyecY:null,
    cIn:null,
    
    eyebX:null,
    eyebY:null,
    bIn:null,
    
    eyedX:null,
    eyedY:null,
    dIn:null,
    
    //hidden node values, may get removed (h1,h2,h3). they work in the same way as an input value, except they are merely based off them.
    h1Val:null,
    h2Val:null,
    h3Val:null,
    
    //a c b d are each sensors, measuring the proximity to other cells.These are the connections between hidden nodes and the outputs.
    a:makeEye(),
    c:makeEye(),
    b:makeEye(),
    d:makeEye(),
    
    //the hidden nodes taking values from the inputs, weighting them, and then forwarding them to outputs. just like the the above.
    h1:makeHid(),
    h2:makeHid(),
    h3:makeHid(),
    h4:makeHid(),
    
    arrayPos:arrayPos, //array position, useful for not choosing the same creature when looking at a population.
    
    health:10,
    
    diet:rand()*100, // percentatage based ability to digest plants/other creatures. cannot be changed except by mutation 0 = herbivore, 100 = carnivore, 23, 46, 1, 85, etc are varying degrees of omnivore. High/low number = faster rate of killing/plant harvesting
    
    rot:rand()*2*Math.PI, //which way is the "creature" pointing.
    speed:0,
    
    xPos:xPos,//start positions
    yPos:yPos,
  };
  
}

function newmakeNet(arrayPos,xPos,yPos) {
  return {
    
    //the input positions. they can be extrapolated directly from the rotation, but for now it is easier to store them here.
    eyeaX:null,
    eyeaY:null,
    aIn:null,
    
    eyecX:null,
    eyecY:null,
    cIn:null,
    
    eyebX:null,
    eyebY:null,
    bIn:null,
    
    eyedX:null,
    eyedY:null,
    dIn:null,
    
    //hidden node values, may get removed (h1,h2,h3). they work in the same way as an input value, except they are merely based off them.
    h1Val:null,
    h2Val:null,
    h3Val:null,
    
    //a c b d are each sensors, measuring the proximity to other cells.These are the connections between hidden nodes and the outputs.

    
    //the hidden nodes taking values from the inputs, weighting them, and then forwarding them to outputs. just like the the above.
    hLayers:makeHLayers(),
    //layers>nodes>node weights.
    
    arrayPos:arrayPos, //array position, useful for not choosing the same creature when looking at a population.
    
    health:10,
    
    diet:rand()*100, // percentatage based ability to digest plants/other creatures. cannot be changed except by mutation 0 = herbivore, 100 = carnivore, 23, 46, 1, 85, etc are varying degrees of omnivore. High/low number = faster rate of killing/plant harvesting
    
    rot:rand()*2*Math.PI, //which way is the "creature" pointing.
    speed:0,
    
    xPos:xPos,//start positions
    yPos:yPos,
  };
  
}
//a network thinking.
function readNet(net) {
  getHVals(net);
  getRotOut(net);
  getSpeedOut(net);
}
// the values of the hidden nodes, after going through the inputs.
function getHVals(net) {
  net.h1Val = (net.aIn * net.a.h1W + net.cIn * net.c.h1W + net.bIn * net.b.h1W + net.dIn * net.d.h1W)/4;
  net.h2Val = (net.aIn * net.a.h2W + net.cIn * net.c.h2W + net.bIn * net.b.h2W + net.dIn * net.d.h2W)/4;
  net.h3Val = (net.aIn * net.a.h3W + net.cIn * net.c.h3W + net.bIn * net.b.h3W + net.dIn * net.d.h3W)/4;
  net.h4Val = (net.aIn * net.a.h4W + net.cIn * net.c.h4W + net.bIn * net.b.h4W + net.dIn * net.d.h4W)/4;
}
//the full output towards the rotation, so the final amount that the network wants to rotate.
function getRotOut(net) {
  net.rot = (net.aIn * net.a.rotW + net.cIn * net.c.rotW + net.bIn * net.b.rotW + net.dIn * net.d.rotW + net.h1Val * net.h1.rotW
  + net.h2Val * net.h2.rotW + net.h3Val * net.h3.rotW + net.h4Val * net.h4.rotW)/8;
}

function getSpeedOut(net) {
  net.speed = (net.aIn * net.a.speedW + net.cIn * net.c.speedW + net.bIn * net.b.speedW + net.dIn * net.d.speedW + net.h1Val * net.h1.speedW + net.h2Val * net.h2.speedW + net.h3Val * net.h3.speedW + net.h4Val * net.h4.speedW)/8;
}
//finds the placement of each of the eyes from the rot of the creature. in radians.
function rotEyes(net) {

//center x= cX
  var cX = net.xPos;
  var cY = net.yPos;
  //0
  net.eyeaX = cX + 30*Math.cos(net.rot);
  net.eyeaY = cY + 30*Math.sin(net.rot);
  // PI
  net.eyecX = cX - 30*Math.cos(net.rot);
  net.eyecY = cY - 30*Math.sin(net.rot);
  // PI/2
  net.eyebX = cX - 30*Math.cos(net.rot + Math.PI/2);
  net.eyebY = cY - 30*Math.sin(net.rot + Math.PI/2);
  // 3PI/2
  net.eyedX = cX - 30*Math.cos(net.rot + 3*Math.PI/2);
  net.eyedY = cY - 30*Math.sin(net.rot + 3*Math.PI/2);
}

function addProxes(net) {
  net.aIn = getProx(net, net.eyeaX, net.eyeaX);
  net.cIn = getProx(net, net.eyecX, net.eyecX);
  net.bIn = getProx(net, net.eyebX, net.eyebX);
  net.dIn = getProx(net, net.eyedX, net.eyedX);
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