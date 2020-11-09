var Window = "";
function initiate(value){
  Window = value;
  Window.canvas = Window.document.getElementById("drawingCanvas");
  Window.stylus = canvas.getContext("2d");
  Window.stylus.fillStyle = "#FFFFFF";
  drawShape('square',0,0,Window.canvas.width,Window.canvas.height);
};
function setColor(value){
  Window.stylus.fillStyle = value;
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
