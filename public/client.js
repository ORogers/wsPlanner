'use strict';


async function onSignIn(googleUser) {
    let auth2 = gapi.auth2.getAuthInstance();
    localStorage.setItem("authToken",auth2.currentUser.get().getAuthResponse().id_token);
    auth2.disconnect();


     let response = await callServer('/api/login','GET')

    document.location.href = '/dashboard.html';
     fillDashboard(googleUser);

}


function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    localStorage.removeItem("authToken");
    auth2.signOut().then(function () {
      console.log('User signed out.');
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

function fillDashboard(user){
    let unitList = ["websrc","webfun","webres"];

    for (let i in unitList){
        let el = document.createElement('li');
        el.innerHTML = unitList[i];
        el.setAttribute("class", "unit");
        $("#sideList").appendChild(el);
    }

    let profile = user.getBasicProfile();
    $("#userPhoto").src = profile.getImageUrl();

}

async function callServer(fetchURL, method, payload) {

    const fetchOptions = {
        credentials: 'same-origin',
        method: method,
        headers: {
            'Authorization': 'Bearer ' + localStorage.authToken,
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
