
document.onclick = function(e){

    cursorX = e.pageX;
    cursorY = e.pageY;
    
    render();
    
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("x: " + e.pageX + ", y: " + e.pageY, 20, worldH - 64);
    ctx.font = "10px Arial";
};