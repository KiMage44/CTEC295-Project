var Window = "";
function initiate(value){
  Window = value;
  Window.canvas = Window.document.getElementById("drawingCanvas");
  Window.stylus = canvas.getContext("2d");
  Window.stylus.fillStyle = "#000000";
  Window.document.getElementById("drawingCanvas").addEventListener("click", function(e){registerClick(e);});
  Window.document.getElementById("drawingCanvas").addEventListener("mousemove", function(e){registerMouseMove(e);});
  Window.document.getElementById("drawingCanvas").addEventListener("mousedown",function(e){registerMouseDown(e);});
  Window.document.getElementById("drawingCanvas").addEventListener("mouseup",function(e){registerMouseUp(e);});
  Window.addEventListener("resize",function(e){resizeCanvas(e);});
};
function setColor(value){
  Window.stylus.fillStyle = value;
  console.log(Window.stylus.fillStyle);
};
function drawShape(type,x,y,width,height){
  switch(type){
    case "circle":
      Window.stylus.beginPath();
      Window.stylus.arc(x,y,width,0,2*Math.PI);
      Window.stylus.fill();
      break;
    case "rectangle":
      Window.stylus.fillRect(x,y,width,height);
      break;
    }
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
function registerClick(e){
  console.log(e.clientX);
  console.log(e.clientY);
}
function registerMouseMove(e){
  var drawPosX = e.clientX - Window.innerWidth*0.1;
  var drawPosY = e.clientY - Window.innerHeight*0.12;
  if(Window.mouseDown){
    console.log("Draw X: "+ drawPosX);
    console.log("Draw Y: "+ drawPosY);
    drawShape('rectangle',drawPosX,drawPosY,2,2);
  }
}
function registerMouseDown(e){
  Window.mouseDown = true;
  console.log("Mousedown = "+Window.mouseDown);
}
function registerMouseUp(e){
  Window.mouseDown = false;
  console.log("Mousedown = "+Window.mouseDown);
}
async function resizeCanvas(e){
  console.log("Window resized, recreating canvas.");
  Window.document.getElementById("drawingCanvas").width = this.innerWidth*0.8;
  Window.document.getElementById("drawingCanvas").height = this.innerHeight*0.8;
}
