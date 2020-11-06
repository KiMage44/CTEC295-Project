var CLIENT_ID = '';
var API_KEY = '';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive';

function handleClientLoad() { gapi.load('client:auth2', initClient); }
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
  });
}
function updateSigninStatus(isSignedIn) {}
function handleAuthClick(event) { gapi.auth2.getAuthInstance().signIn(); }
function handleSignoutClick(event) { gapi.auth2.getAuthInstance().signOut(); }

async function createFile(){
  var fileCont = "C:\\Users\\Admin\\Pictures\\acceptance.png";
  var file = new Blob([fileCont], {type: 'image/png'});
  var metadata = {
    'name': 'soup',
  'mimeType':'image/png'
  };
  var accesstok = gapi.auth.getToken().access_token;

  var bodyContent = new URLSearchParams();
  bodyContent.append('metadata', new Blob([JSON.stringify(metadata)], { type: "application/json"}));
  bodyContent.append("uploadType","media");

  var myHeaders = new Headers();
  myHeaders.append("Authorization","Bearer "+accesstok);
  myHeaders.append("Content-Type","image/png");
  myHeaders.append("Content-Length","343712");

  var request = new Request("https://www.googleapis.com/upload/drive/v3/files", {
    method: "POST",
    headers: myHeaders,
    body: bodyContent
  });
  let accessData = await fetchRequest(request);
  return accessData;
}
async function fetchRequest(request){
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300)
  {return response.json();}
  else
  {return Promise.reject(new Error(response.statusText));}
};
