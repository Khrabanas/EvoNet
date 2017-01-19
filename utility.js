


var selected = {org: [], plants: [],};
function clickData() {
    selected = {org: [], plants: [],};
    for(i=0; i < pop.length; i++) {
        if (findDis(cursorX, cursorY, pop[i].x, pop[i].y) < pop[i].radius * pop[i].radius) {
            selected.org[selected.org.length] = pop[i];
            console.dir(pop[i]);
        }
    }
    console.log("selected " + selected.org.length + " organism(s) and " + selected.plants.length + " plant(s).")
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    cursorX = evt.clientX - rect.left
    cursorY = evt.clientY - rect.top
}

document.onclick = function(e){
    var pos = getMousePos(canvas, e);

    clickData();
    
    render();
    
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("x: " + e.pageX + ", y: " + e.pageY, 20, worldH - 64);
    ctx.font = "10px Arial";
};
