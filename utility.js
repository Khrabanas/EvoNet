


var selected = {
    org: [],
    plants: [],
};
function clickData() {
  if (keyboard[16] !== true) {
    selected = {
      org: [],
      plants: [],
    };
  }
  for(i=0; i < pop.length; i++) {
    if (pop[i] == null) {
      continue;
    }
    if (findDis(cursorX, cursorY, pop[i].x, pop[i].y) < pop[i].radius * pop[i].radius) {
      selected.org[selected.org.length] = pop[i];
      console.dir(pop[i]);
      ctx.lineWidtth = 5;
      circle(pop[i].x, pop[i].y, pop[i].radius, "purple");
      ctx.lineWidtth = 1;
    }
  }
  console.log("selected " + selected.org.length + " organism(s) and " + selected.plants.length + " plant(s).");
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  cursorX = evt.clientX - rect.left;
  cursorY = evt.clientY - rect.top;
}

document.onclick = function(e){
    var pos = getMousePos(canvas, e);

    if(cursorX > worldW || cursorY > worldH) {
        return;
    }
    clickData();
    render();
    for(var i = 0; i < selected.org.length; i++) {
        circle(selected.org[i].x, selected.org[i].y, selected.org[i].radius, "purple", 5);
        ctx.lineWidtth = 1;
    }

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("x: " + e.pageX + ", y: " + e.pageY, 20, worldH - 64);
    ctx.font = "10px Arial";
};

var keyboard = [];
window.onkeyup = function(e) {
    keyboard[e.keyCode] = false;
};
window.onkeydown = function(e) {
    keyboard[e.keyCode] = true;
};
