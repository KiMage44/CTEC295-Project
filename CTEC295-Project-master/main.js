//environment variables used by Google API
var CLIENT_ID = '';
var API_KEY = '';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive';

//My environment variables
var Window = "";
var currentFile = "";
var canvas = "";
var stylus = "";
var mouseDown = false;
var LoginCredentials;
var Pencil = {
  shape: 0, //circle
  size: 4,
  color: "#485353",
};
var Pen = {
  shape: 1,//square
  size: 4,
  color: "#000000",
};
var Marker = {
  shape: 2, //marker
  size: 10,
  color: "#000000",
};
var PrebuiltStylusSettings = [Pencil,Pen,Marker];
var stylusSettings = PrebuiltStylusSettings[0];
var CanvasSnapshots = [];
var acceptedImageTypes = ["image/jpeg","image/jpg","image/gif","image/png"];
var undoLayer = 0;
var drawingStatus = 0; //0= not drawing, 1 = drawing, 2= drawing has completed
var isDrawing = 0;
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
     LoginCredentials = gapi.auth2.getAuthInstance();
     googleUserAccount = LoginCredentials.currentUser.get();
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
  });
}
function updateSigninStatus(isSignedIn) {}
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
  Window.document.getElementById("signOutDrive").hidden = false;
  Window.document.getElementById("signInDrive").hidden = true;
}
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  Window.getElementById("signOutDrive").hidden = true;
  Window.getElementById("signInDrive").hidden = false;
};
//INIT FUNCTION
function WebPageContentSetup(value){
  Window = value;
  canvas = Window.document.getElementById("drawingCanvas");
  stylus = canvas.getContext("2d");
  canvas.width = Window.innerWidth*0.8;
  canvas.height = Window.innerHeight*0.8;
  wipeCanvas();

  //Event Listeners for webpage
  Window.addEventListener("resize",function(e){handleCanvasResize(e);});//resizeCanvas(e);
  Window.document.getElementById("drawingCanvas").addEventListener("mousemove", function(e){handleMouseMovement(e);});
  Window.document.getElementById("drawingCanvas").addEventListener("mousedown",function(e){isDrawing = 1;});
  Window.document.getElementById("drawingCanvas").addEventListener("mouseup",function(e){isDrawing = 0;});
  var fileSelect = Window.document.getElementById("fileInput").addEventListener("change", event => {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(file);
      if(checkFileType(file.type)) loadImageOntoCanvas(file);
      else console.error("fileType "+file.type+" not accepted, import aborted.");
  });
  //console.log("Webpage setup completed");
};
//ALL JS METHODS RELATING TO FILE/API INTERACTION
function setupPCSave(){
  Window.document.getElementById("pcsave").href = canvas.toDataURL("image/png");
};
function setupDriveSave(){
  var fileName = Window.prompt("Please enter a file name.");
  var imagetype = true;
  var fileType = "";
  while(imagetype){
    fileType = Window.prompt("Please enter a file type. (image/png, image/jpg, or image/jpeg)");
    console.log(fileType);
    if(checkFileType(fileType))
      imagetype = false;
    else
      Window.alert("please enter a valid file type and try again.");
  }
  var fileInfo = {
    name: fileName,
    type: fileType
  };
  driveMultipartUpload(fileInfo);
};
function driveBasicUpload(){
  var fileInfo = {name:"Draw.NETUpload", type: "image/png"};
  var url = new URL("https://www.googleapis.com/upload/drive/v3/files");
  url.searchParams.append("uploadType","media");
  getCanvasData().then(function(data){
    var file = new File([data],fileInfo.name,{type:fileInfo.type});
    var request = new Request(url, {
      method: "POST",
      headers: {'Content-Type':fileInfo.type, 'Content-Length':file.size,
      'Authorization':"Bearer "+googleUserAccount.xc.access_token},
      body: file,
    });
    fetchRequest(request).then(function(e){console.log(e);});
  });
};
function driveMultipartUpload(metadata){
  var form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
  var url = new URL('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,kind');

  getCanvasData().then(function(data){
    var file = new File([data],metadata.name,{type:metadata.type});
    form.append('file', file);
      var request = new Request(url, {
        method: 'POST',
        headers: new Headers({'Authorization': 'Bearer ' + googleUserAccount.xc.access_token}),
        body: form
      });
      fetchRequest(request);
  });
};
async function fetchRequest(request){
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300) {return response;}
  else {return Promise.reject(new Error(response.statusText));}
};

function checkFileType(fileType){
  for(i=0; i<acceptedImageTypes.length; i++){
    if(fileType == acceptedImageTypes[i])
      return true;
  }
  return false;
};
function loadFileAsCanvas(givenFile){ //loadSnapshottoCanvas()
  var image = new Image();
  image.onload = function(){
    canvas.width = image.width;
    canvas.height = image.height;
    stylus.drawImage(image,0,0);
  };
  var reader = new FileReader();
  reader.onload = function(event){
    image.src = event.target.result;
  };
  reader.readAsDataURL(givenFile);
};
function loadImageOntoCanvas(givenFile){ //loadImagetoCanvas()
  var image = new Image();
  image.onload = function(){
    stylus.drawImage(image,0,0,canvas.width,canvas.height);
    saveCanvasSnapshot();
  };
  var reader = new FileReader();
  reader.onload = function(event){
    image.src = event.target.result;
  };
  reader.readAsDataURL(givenFile);
}

//Methods involving interacting with Canvas
function handleMouseMovement(e){ //registerMouseMove()
  var x = e.clientX - canvas.getBoundingClientRect().left;
  var y = e.clientY - canvas.getBoundingClientRect().top;
  handleCursorDrawing(x,y);
};
function handleCanvasResize(e){ //resizeCanvas()
    canvas.width = Window.innerWidth*0.8;
    canvas.height = Window.innerHeight*0.8;
    loadImageOntoCanvas();
};
async function getCanvasData(){
  var image = canvas.toDataURL("image/png");
  return fetch(image).then(function(res){
    return res.arrayBuffer();
  }).then(function(buf){ return buf; });
};
function saveCanvasSnapshot(){ //saveSnapshot()
  getCanvasData().then(function(data){
    CanvasSnapshots[CanvasSnapshots.length] = data;
    undoLayer = CanvasSnapshots.length-1;
  });
};
async function saveCanvastoFile(fileInfo){
  getCanvasData().then(function(data){
    var file = new File([data],fileInfo.name,{type:fileInfo.type});
    return file;
  });
};
function buildFileFromSnapshot(snapshot){
  var file = new File([snapshot],"snapshot",{type: "image/png"});
  return file;
};
function undo(){
  if(undoLayer > 0)
    undoLayer -= 1;
  loadFileAsCanvas(buildFileFromSnapshot(CanvasSnapshots[undoLayer]));
};
function redo(){
  if(undoLayer < CanvasSnapshots.length-1)
    undoLayer += 1;
  loadFileAsCanvas(buildFileFromSnapshot(CanvasSnapshots[undoLayer]));
};
function resetSnapShotArray(){
  var temp = [];
  for(i=0;i<=undoLayer;i++)
    temp[i] = CanvasSnapshots[i];
  CanvasSnapshots = temp;
};

//Methods involving drawing onto Canvas
function wipeCanvas(){
  stylus.fillStyle = "#FFFFFF";
  stylus.fillRect(0,0,canvas.width,canvas.height);
  saveCanvasSnapshot();
};
function setStylus(value){
  stylusSettings = PrebuiltStylusSettings[value];
};
function setStylusSize(size){
  stylusSettings.size = size;
};
function setStylusShape(shape){
  stylusSettings.shape = shape;
};
function setStylusColor(color){
  stylusSettings.color = color;
};
function handleCursorDrawing(x,y){
  if(isDrawing == 1){
    draw(x,y);
    drawingStatus = 1;
  }
  if(drawingStatus == 1 && isDrawing == 0){
    drawingStatus = 2;
    if(undoLayer != (CanvasSnapshots.length-1))
      resetSnapShotArray();
    saveCanvasSnapshot();
  }
  if(isDrawing == 0)
    drawingStatus = 0;
};
function draw(x,y){
  stylus.fillStyle = stylusSettings.color;
  switch(stylusSettings.shape){
    case 0: //shape to draw is a circle
      drawCircle(x,y);
      break;
    case 1: //shape to draw is a square
      drawSquare(x,y);
      break;
    case 2: //shape to draw is an oval
      drawMarker(x,y);
      break;
    default:
      console.log("broke");
  };
};
function drawCircle(x,y){
  stylus.beginPath();
  stylus.arc(x,y,stylusSettings.size,0,2*Math.PI);
  stylus.fill();
};
function drawMarker(x,y){
  stylus.beginPath();
  stylus.ellipse(x,y,stylusSettings.size*0.2,stylusSettings.size,0,0,2*Math.PI);
  stylus.fill();
};
function drawSquare(x,y){
  stylus.fillRect(x,y,stylusSettings.size,stylusSettings.size);
};