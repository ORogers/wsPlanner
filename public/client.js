'use strict';


async function onSignIn(googleUser) {
    let auth2 = gapi.auth2.getAuthInstance();
    localStorage.setItem("upUser",JSON.stringify(googleUser.getBasicProfile()));
    localStorage.setItem("upAuthToken",auth2.currentUser.get().getAuthResponse().id_token);
    auth2.disconnect();


    let response = await callServer('/api/login','GET')
    document.location.href = '/dashboard.html';


}


function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    localStorage.removeItem("upAuthToken");
    localStorage.removeItem("upUser");
    auth2.signOut().then(function () {
      console.log('User signed out.');
      document.location.href = '/index.html';
    });
}


//removes auth token on page leave
// window.onbeforeunload = () =>{
//     console.log("goodbye");
//     signOut();
// }

function $(query) {
    return document.querySelector(query);
}

async function testAuth(){
    let el = $('#server-response');
    el.textContent = "loading...";
    const response = await callServer('/api','GET');
    const data = await response.text();
    el.textContent = data;


}

function fillDashboard(){
    // let unitList = ["websrc","webfun","webres"];
    //
    // for (let i in unitList){
    //     let el = document.createElement('li');
    //     el.innerHTML = unitList[i];
    //     el.setAttribute("class", "unit");
    //     $("#sideList").appendChild(el);
    //}
    let topicList = document.querySelectorAll(".topics");
    for (let topic of topicList){
        topic.addEventListener("ondragstart",dragStarted);
        topic.addEventListener("ondragover",draggingOver);
        topic.addEventListener("ondrop",dropped);
    }
    let user = JSON.parse(localStorage.upUser)
    $("#userPhoto").src = user.Paa
    $(".g-signin2").style.display = "none";

}

let source;
function dragStarted(evt){
//start drag
console.log("grag start");
source=evt.target;
//set data
evt.dataTransfer.setData("text/plain", evt.target.innerHTML);
//specify allowed transfer
evt.dataTransfer.effectAllowed = "move";
}

function draggingOver(e){
//drag over
e.preventDefault();
//specify operation
e.dataTransfer.dropEffect = "move";
}

function dropped(evt){
//drop
evt.preventDefault();
evt.stopPropagation();
//update text in dragged item
source.innerHTML = evt.target.innerHTML;
let classHolder = source.getAttribute("class")
source.classList.add(evt.target.getAttribute("class"));
evt.target.classList = classHolder;
//update text in drop target
evt.target.innerHTML = evt.dataTransfer.getData("text/plain");

}

function sendUnit(){
    let unit = {
        title: $('#uName').value,
        sTitle: $('#uSName').value,
        desc: $('#uDesc').value,
        weeks: $('#uWeeks').value
    }
    callServer('/api/unit',"POST",unit);
}

async function callServer(fetchURL, method, payload) {

    const fetchOptions = {
        credentials: 'same-origin',
        method: method,
        headers: {
            'Authorization': 'Bearer ' + localStorage.upAuthToken,
        },
    };

    console.log(`${method} ${fetchURL}`);

    if (payload) {
        let data = JSON.stringify(payload);
        fetchOptions.body = data;
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.headers['Accept'] = 'application/json';
    }
    let response = await fetch(fetchURL, fetchOptions);

    return response;

}
