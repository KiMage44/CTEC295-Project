
//environment variables used by Google API
var CLIENT_ID = '';
var API_KEY = '';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive';

//My environment variables
var Window = "";
var LoginCredentials;
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
var CanvasSnapshots = [];
var acceptedImageTypes = ["image/jpeg","image/gif","image/png"];
var undoLayer = 0;
var drawingStatus = 0; //0= not drawing, 1 = drawing, 2= drawing has completed
var isDrawing = 0;

//ALL JS METHODS IMPLEMENTED BY GOOGLE API
function handleClientLoad(value) {
  Window = value;
  gapi.load('client:auth2', initClient);
  WebPageContentSetup(); //initializes setup of webpage after api init is finished.
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
function handleAuthClick(event) { gapi.auth2.getAuthInstance().signIn(); }
function handleSignoutClick(event) { gapi.auth2.getAuthInstance().signOut(); }

//INIT FUNCTION
function WebPageContentSetup(){
  Window = this;
  Window.currentFile = '';
  Window.canvas = Window.document.getElementById("drawingCanvas");
  Window.stylus = canvas.getContext("2d");
  Window.drawingPen = DefaultPen;
  Window.canvas.width = Window.innerWidth*0.8;
  Window.canvas.height = Window.innerHeight*0.8;
  Window.mouseDown = false;
  saveSnapshot();

  //Event Listeners for webpage
  Window.addEventListener("resize",function(e){resizeCanvas(e);});
  Window.document.getElementById("drawingCanvas").addEventListener("mousemove", function(e){registerMouseMove(e);});
  Window.document.getElementById("drawingCanvas").addEventListener("mousedown",function(e){isDrawing = 1;});
  Window.document.getElementById("drawingCanvas").addEventListener("mouseup",function(e){isDrawing = 0;});
  var fileSelect = Window.document.getElementById("fileInput").addEventListener("change", event => {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(file);
      if(checkFileType(file.type)){
        console.log("fileType accepted, importing image now.");
        loadImagetoCanvas(file);
      }
      else{
        console.log("fileType "+file.type+" not accepted, import aborted.");
      }


    });
    console.log("Webpage setup completed");
};
//ALL JS METHODS RELATING TO FILE/API INTERACTION
async function postFileToDrive(){
  var file = saveCanvastoFile().then(function(file){
    console.log("loading file for upload:"+file);
    var url = new URL("https://www.googleapis.com/upload/drive/v3/files");
    url.searchParams.append("uploadType","media");
    var request = new Request(url, {
      method: "POST",
      headers: {'Content-Type':"image/png", 'Content-Length':file.size,
      'Authorization':"Bearer "+googleUserAccount.xc.access_token},
      body: file,
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
  var fileAccepted = false;
  for(i=0; i<acceptedImageTypes.length; i++){
    if(fileType == acceptedImageTypes[i])
      fileAccepted = true;
  }
  return fileAccepted;
};

// ALL JS METHODS RELATING TO CANVAS AND DRAWING FUNCTIONS
function setColor(value){
  Window.drawingPen.color = value;
};
function loadSnapshottoCanvas(passedImage){
  image = new Image();
  image.onload = function(){
    Window.canvas.width = image.width;
    Window.canvas.height = image.height;
    Window.stylus.drawImage(image,0,0);
  };
  var reader = new FileReader();
  reader.onload = function(event){
    image.src = event.target.result;
  };
  reader.readAsDataURL(passedImage);
};
function loadImagetoCanvas(passedImage){
  var image = new Image();
  image.onload = function(){
    Window.stylus.drawImage(image,0,0,Window.canvas.width,Window.canvas.height);
    saveSnapshot();
  };

  var reader = new FileReader();
  reader.onload = function(event){
    image.src = event.target.result;
  };
  reader.readAsDataURL(passedImage);
};
function wipeCanvas(){
  Window.stylus.fillStyle = "#FFFFFF";
  Window.stylus.fillRect(0,0,Window.canvas.width,Window.canvas.height)
}
function registerMouseMove(e){
  var x = e.clientX - Window.canvas.getBoundingClientRect().left;
  var y = e.clientY - Window.canvas.getBoundingClientRect().top;
  if(isDrawing == 1){
    draw(Window.drawingPen,x,y);
    drawingStatus = 1;
  }
  if(drawingStatus == 1 && isDrawing == 0){
    drawingStatus = 2;
    if(undoLayer != (CanvasSnapshots.length -1))
      resetSnapShotArray();
    saveSnapshot();
  }
  if(isDrawing == 0){
    drawingStatus = 0;
  }
};
function resizeCanvas(e){
    Window.canvas.width = this.innerWidth*0.8;
    Window.canvas.height = this.innerHeight*0.8;
    console.log("loading last snapshot");
    Window.currentFile = loadLatestSnapShot();
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
function draw(pen,x,y){
  switch(pen.shape){
    case "circle":
      Window.stylus.fillStyle = pen.color;
      Window.stylus.beginPath();
      Window.stylus.arc(x,y,Window.drawingPen.size,0,2*Math.PI);
      Window.stylus.fill();
      break;
    case "square":
    console.log("square");
      Window.stylus.fillStyle = pen.color;
      Window.stylus.fillRect(x,y,width,height)
    default:
    console.log("broke");

  }
};
function undo(){
  if(undoLayer > 0)
    undoLayer -= 1;
  loadSnapshottoCanvas(CanvasSnapshots[undoLayer]);
};
function redo(){
  if(undoLayer < CanvasSnapshots.length-1)
    undoLayer += 1;
  loadSnapshottoCanvas(CanvasSnapshots[undoLayer]);
};
function saveSnapshot(){
  saveCanvastoFile().then(function(file){
    CanvasSnapshots[CanvasSnapshots.length] = file;
    console.log("snapshot saved");
    console.log(CanvasSnapshots);
    undoLayer = CanvasSnapshots.length-1;
  });
};
function resetSnapShotArray(){
  console.log("undo layer was lower than latest snapshot, eliminating all snapshots after current layer.");
  var temp = [];
  for(i=0;i<=undoLayer;i++)
    temp[i] = CanvasSnapshots[i];
  CanvasSnapshots = temp;
};
async function saveCanvastoFile(){
  var image = Window.canvas.toDataURL("image/png");
  return fetch(image).then(function(res){
    return res.arrayBuffer();
  }).then(function(buf){
    var file = new File([buf],"test.png",{type:"image/png"});
    return file;
  });
};
function loadLatestSnapShot(){
  if(CanvasSnapshots.length == 0)
    Window.currentFile = CanvasSnapshots[0];
  else
    Window.currentFile = CanvasSnapshots[CanvasSnapshots.length - 1];
  if(undoLayer != (CanvasSnapshots.length -1)){
    //console.log("current Snapshot is less than latest Snapshot, loading current snapshot");
    Window.currentFile = CanvasSnapshots[undoLayer];
  }
  loadSnapshottoCanvas();
}
