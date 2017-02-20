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
//TODO Implement a fast prng
var worldW = 1000;
var worldH = 1000;

canvas.width=worldH;
canvas.height=worldW;
ctx.font = "10px Arial";


var points = [{x:0,y:0},{x:0,y:0}];
var current = 0;
var circle = {x:10, y:10, r:10};
function newcircle() {
  circle.x = rand()*worldW;
  circle.y = rand()*worldH;
  circle.r = rand()*100
}
function makecircle(centerX, centerY, radius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.stroke();
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    cursorX = evt.clientX - rect.left;
    cursorY = evt.clientY - rect.top;
}
function line(startX, startY, endX, endY) {

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}
document.onclick = function(e){
    getMousePos(canvas, e);

    if(cursorX > worldW || cursorY > worldH) {
        return;
    }

    if (current == 0) {
      points[current].x = cursorX;
      points[current].y = cursorY;
      current++;
    } else {
      points[current].x = cursorX;
      points[current].y = cursorY;
      current--;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    makecircle(points[0].x, points[0].y, 5);
    makecircle(points[1].x, points[1].y, 5);
    line(points[0].x, points[0].y, points[1].x, points[1].y);
    makecircle(circle.x, circle.y, circle.r);
    intersects = lineCircle(points[0].x, points[0].y, points[1].x, points[1].y, circle.x, circle.y, circle.r);
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("("+points[0].x +","+points[0].y+")" +"("+points[1].x +","+points[1].y+")" + "("+ circle.x+","+circle.y+") " + circle.r + "   " + intersects, 20, worldH - 64);
    ctx.font = "10px Arial";
};

var intersects = false;
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
