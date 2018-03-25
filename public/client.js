'use strict';
//Global var to hould units
let currentUnit = {};


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

async function fillDashboard(){
    let units = await getUnits();
    // let topicList = document.querySelectorAll(".topics");
    // for (let topic of topicList){
    //     topic.addEventListener("ondragstart",dragStarted);
    //     topic.addEventListener("ondragover",draggingOver);
    //     topic.addEventListener("ondrop",dropped);
    // }

    //Fills unit list

    fillUnitList(units);
    let user = JSON.parse(localStorage.upUser)
    $("#userPhoto").src = user.Paa
    $(".g-signin2").style.display = "none";

}
function fillUnitList(units){
    let unitList = $('#units');
    for (let unit of units){
        let option = document.createElement("option");
        option.text = unit.uShortTitle;
        option.value = unit.uID;
        unitList.add(option);
    }

    let addNewOp = document.createElement("option");
    addNewOp.text = "Add new unit";
    addNewOp.value = "+";
    unitList.add(addNewOp);

    unitList.addEventListener("change", unitChanged);
    refreshTopics();

}
async function refreshTopics(){
    let unit = $('#units').value;
    let response = await callServer(('/api/topics?uID=' + unit) ,'GET')
    fillTopics(response);
}

function fillTopics(topics){
    let topicsList = $('#topicList');
    topicsList.innerHTML= "";
    for (let topic of topics){
        let li = document.createElement("li");
        li.innerHTML = topic.tName;
        li.addEventListener("dragstart",dragStarted);
        li.addEventListener("dragover",draggingOver);
        li.addEventListener("dragover",draggingOver);
        li.addEventListener("drop",dropped);
        li.addEventListener("click",setCurrentTopic);
        li.setAttribute('value',topic.tID);
        li.setAttribute('draggable',true);
        topicsList.appendChild(li);
    }
    let li = document.createElement("li");
    li.innerHTML = "+";
    li.setAttribute('value','+');
    topicsList.appendChild(li);
}

async function unitChanged(event){
    if (event.target.value == "+"){
        document.location.href = '/editUnit.html';
    }else{
        let url = '/api/unit?uID=' + event.target.value;
        let unit = await callServer(url,'GET');
        currentUnit.topics = unit.topics;
        currentUnit.unit = unit.unit[0];
        fillTopics(unit.topics);
        fillInfobar(unit.unit[0]);
    }
}

function setCurrentTopic(event){
    currentUnit.currentTopic = event.target.value;
    let topic = currentUnit.topics.filter(topic => topic.tID == currentUnit.currentTopic);
    fillInfobar(topic[0]);
}

function fillInfobar(topic){
    $('#unitTitle').textContent = currentUnit.unit.uTitle;
    $('#topicName').value = topic.tName;
    $('#tWeeks').value = topic.tWeeks;

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
    let valueHolder = source.getAttribute("value")
    source.setAttribute("value",evt.target.value);
    evt.target.setAttribute("value",valueHolder);
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
    let response = callServer('/api/unit',"POST",unit);
}

function sendTopic(){

    let topic = {
        name: $('#topicName').value,
        uID: $('#units').value,
        leader: $('#leader').value,
        weeks: $('#tWeeks').value
    }
    let response = callServer('/api/topic',"POST",topic);
    refreshTopics();
}


async function getUnits(){
    let units = await callServer('/api/unit',"GET");
    return(units);
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
    if (!response.ok) {
        // handle the error
        console.log("Server error:\n" + response.status);
        return;
    }

    // handle the response
    let data = await response.text();
    if (!data) {
        data = JSON.stringify({
            error: "error on fetch"
        });
    }

    try {
        data = JSON.parse(data);
    } catch (err) {
        data = {
            response: data
        };
    }
    return data;

}
