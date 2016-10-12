var canvas = geid('canvas');
var ctx = canvas.getContext('2d');

//get id, so I can easily make a ui.
function geid(id) {
  return document.getElementById(id);
}
//may later change to a PRNG
function rand() {
  return Math.random();
} // ^ this is using javascript random, which is not seedable.
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
//easy mode
function poputat(popCount) {
  newPop(popCount);
  newHabitat(popCount/2);
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
//I need to turn up down left right into a b c d. MUUUCH LESS CONFUSING.

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
  
  net.xPos = net.xPos - (net.speed * Math.cos(net.rot));
  net.yPos = net.yPos - (net.speed * Math.sin(net.rot));
 
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
function makeHid() {
 return {
   rotW:rand(),
   speedW:rand(),
 };
}
function makeNet(arrayPos,xPos,yPos) {
  return {
    
    //the input positions. they can be extrapolated directly from the rotation, but for now it is easier to store them here.
    eyeUpX:null,
    eyeUpY:null,
    upIn:null,
    
    eyeDownX:null,
    eyeDownY:null,
    downIn:null,
    
    eyeLeftX:null,
    eyeLeftY:null,
    leftIn:null,
    
    eyeRightX:null,
    eyeRightY:null,
    rightIn:null,
    
    //hidden node values, may get removed (h1,h2,h3). they work in the same way as an input value, except they are merely based off them.
    h1Val:null,
    h2Val:null,
    h3Val:null,
    
    //up down left right are each sensors, measuring the proximity to other cells.These are the connections between hidden nodes and the outputs.
    up:makeEye(),
    down:makeEye(),
    left:makeEye(),
    right:makeEye(),
    
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
//a network thinking.
function readNet(net) {
  getHVals(net);
  getRotOut(net);
  getSpeedOut(net);
}
// the values of the hidden nodes, after going through the inputs.
function getHVals(net) {
  net.h1Val = (net.upIn * net.up.h1W + net.downIn * net.down.h1W + net.leftIn * net.left.h1W + net.rightIn * net.right.h1W)/4;
  net.h2Val = (net.upIn * net.up.h2W + net.downIn * net.down.h2W + net.leftIn * net.left.h2W + net.rightIn * net.right.h2W)/4;
  net.h3Val = (net.upIn * net.up.h3W + net.downIn * net.down.h3W + net.leftIn * net.left.h3W + net.rightIn * net.right.h3W)/4;
  net.h4Val = (net.upIn * net.up.h4W + net.downIn * net.down.h4W + net.leftIn * net.left.h4W + net.rightIn * net.right.h4W)/4;
}
//the full output towards the rotation, so the final amount that the network wants to rotate.
function getRotOut(net) {
  net.rot = (net.upIn * net.up.rotW + net.downIn * net.down.rotW + net.leftIn * net.left.rotW + net.rightIn * net.right.rotW + net.h1Val * net.h1.rotW
  + net.h2Val * net.h2.rotW + net.h3Val * net.h3.rotW + net.h4Val * net.h4.rotW)/8;
}

function getSpeedOut(net) {
  net.speed = (net.upIn * net.up.speedW + net.downIn * net.down.speedW + net.leftIn * net.left.speedW + net.rightIn * net.right.speedW + net.h1Val * net.h1.speedW + net.h2Val * net.h2.speedW + net.h3Val * net.h3.speedW + net.h4Val * net.h4.speedW)/8;
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