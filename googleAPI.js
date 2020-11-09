var CLIENT_ID = '1082519719763-p93jidt452epb2u7gvathglruul0f744.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCMU95EgLXtueBNYhAl4UoGeCxB232uNUI';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive';
var Window = "";
var LoginCredentials;
function handleClientLoad() { gapi.load('client:auth2', initClient); }
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
function initialContentSetup(window){
  Window = window;
  Window.currentFile = '';
  var picture = Window.document.getElementById("picture");
  var fileSelect = Window.document.getElementById("fileInput").addEventListener("change", event => {
      var file = event.target.files[0];
      changeCurrentFile(file);
      var reader = new FileReader();
      //reader.addEventListener('load', event => { picture.src = event.target.result; });
      reader.readAsDataURL(file);
    });
};
function postFileToDrive(){
  var file = Window.currentFile;
  var url = new URL("https://www.googleapis.com/upload/drive/v3/files");
  url.searchParams.append("uploadType","media");
  var request = new Request(url, {
    method: "POST",
    headers: {'Content-Type':"image/png", 'Content-Length':file.size,
    'Authorization':"Bearer "+googleUserAccount.wc.access_token},
    body: file,
  });
  fetchRequest(request);
};
async function fetchRequest(request){
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300)
  {return response;}
  else
  {return Promise.reject(new Error(response.statusText));}
};
function changeCurrentFile(file){
  Window.currentFile = file;
};
