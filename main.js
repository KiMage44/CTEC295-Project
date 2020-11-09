var Window = "";
var canvas = "";
var stylus = "";
function initiate(value){
  Window = value;
  canvas = Window.document.getElementById("drawingCanvas");
  stylus = canvas.getContext("2d");
  stylus.fillStyle = "#FFFFFF";
};
function setColor(value){
  stylus.fillStyle = value;
};
function drawShape(type,x,y,width,height){
  switch(type){
    case "circle":
      stylus.beginPath();
      stylus.arc(x,y,width,0,2*Math.PI);
      stylus.fill();
      break;
    case "rectangle":
      stylus.fillRect(x,y,width,height);
      break;
    }
};
function saveDrawingToDrive(){
  var image = canvas.toDataURL();
  console.log(image);
  return image;
};
function loadImagetoCanvas(){
   Window.image = new Image();
  Window.image.onload = function(){
    stylus.drawImage(Window.image,0,0);
    stylus.fillStyle = "rgba(200, 0, 0, 0.5)";
    stylus.fillRect(0, 0, 500, 500);
  };
  var reader = new FileReader();
  reader.onload = function(event){
    Window.image.src = event.target.result;
  };
  reader.readAsDataURL(Window.currentFile);
};
