var DefaultPen = {
  shape: 'circle',
  size: 2,
  color: "#000000",
};
var SquarePen = {
  shape: 'square',
  size: 2,
  color: "#000000",
};
function initiate(value){
  var Window = value;
  Window.drawingPen = DefaultPen;
  Window.canvas = Window.document.getElementById("drawingCanvas");
  Window.stylus = canvas.getContext("2d");
  Window.document.getElementById("drawingCanvas").addEventListener("mousemove", function(e){registerMouseMove(e);});
  Window.document.getElementById("drawingCanvas").addEventListener("mousedown",function(e){Window.mouseDown = true;;});
  Window.document.getElementById("drawingCanvas").addEventListener("mouseup",function(e){Window.mouseDown = false;;});
  Window.addEventListener("resize",function(e){resizeCanvas(e);});
};
function setColor(value){
  Window.drawingPen.color = value;
};
function loadImagetoCanvas(){
  Window.image = new Image();
  Window.image.onload = function(){
    Window.canvas.width = Window.image.width;
    canvas.height = Window.image.height;
    Window.stylus.drawImage(Window.image,0,0);
  };
  var reader = new FileReader();
  reader.onload = function(event){
    Window.image.src = event.target.result;
  };
  reader.readAsDataURL(Window.currentFile);
};
function wipeCanvas(){
  Window.stylus.fillStyle = "#FFFFFF";
  drawShape('rectangle',0,0,Window.canvas.width,Window.canvas.height);
}
function registerMouseMove(e){
  var drawPosX = e.clientX - Window.innerWidth*0.1;
  var drawPosY = e.clientY - Window.innerHeight*0.075;
  if(Window.mouseDown){
    switch(Window.drawingPen.shape){
      case "circle":
        Window.stylus.fillStyle = Window.drawingPen.color;
        Window.stylus.beginPath();
        Window.stylus.arc(drawPosX,drawPosY,Window.drawingPen.size,0,2*Math.PI);
        Window.stylus.fill();
        break;
      case "square":
      console.log("square");
        Window.stylus.fillStyle = Window.drawingPen.color;
        Window.stylus.fillRect(x,y,width,height)
      default:
      console.log("broke");

    }
  }
};
function resizeCanvas(e){
  Window.document.getElementById("drawingCanvas").width = this.innerWidth*0.8;
  Window.document.getElementById("drawingCanvas").height = this.innerHeight*0.8;
};
function setPen(value){
  console.log(value);
  switch(value){
    case "squarePen":
      Window.drawingPen = SquarePen;
    case "cirlcePen":
      Window.drawingPen = DefaultPen;
  }
}
