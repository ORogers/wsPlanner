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
}

function fillTopics(topics){
    let topicsList = $('#topicList');
    topicsList.innerHTML= "";
    currentUnit.currentTopic = topics[0];


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
        li.style.height = String (6 * topic.tWeeks) + "vh";
        topicsList.appendChild(li);
    }
    let li = document.createElement("li");
    li.innerHTML = "+";
    li.addEventListener('click',addEmptyTopic)
    topicsList.appendChild(li);
}

async function unitChanged(event){
    if (event.target.value == "+"){
        document.location.href = '/addUnit.html';
    }else{
        saveTopics();
        let url = '/api/unit?uID=' + event.target.value;
        let unit = await callServer(url,'GET');
        console.log(unit);
        currentUnit.topics = unit.topics;
        currentUnit.unit = unit.unit[0];
        currentUnit.currentTopic = unit.topics[0];
        fillTopics(unit.topics);
        fillInfobar(currentUnit.topics[0]);
        $("#mainContentFlex").innerHTML = " ";
        fillNotes();
    }
}

function setCurrentTopic(event){
    storeTopicChanges();
    currentUnit.currentTopic = (currentUnit.topics.filter(topic => topic.tName == event.target.textContent))[0];
    fillInfobar(currentUnit.currentTopic);
    $("#mainContentFlex").innerHTML = " ";
    fillNotes();
}

function storeTopicChanges(){
    if(currentUnit != {}){
        currentUnit.topics = currentUnit.topics.filter(topic => topic.tID != currentUnit.currentTopic.tID);
        addTopicToList(currentUnit.currentTopic.tID);
    }
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
    let hightHolder = source.style.height
    source.style.height = evt.target.style.height;
    source.setAttribute("value",evt.target.value);
    evt.target.setAttribute("value",valueHolder);
    evt.target.style.height = hightHolder;
    //update text in drop target
    evt.target.innerHTML = evt.dataTransfer.getData("text/plain");

}

async function sendUnit(){
    if(validateAddUnit()){
        $('#submitUnit').value = "Sending Unit... "
        let unit = {
            title: $('#uName').value,
            sTitle: $('#uSName').value,
            desc: $('#uDesc').value,
            weeks: $('#uWeeks').value
        }
        let response = await callServer('/api/unit',"POST",unit);
        if(response[1] == null){
            window.location.href = "/dashboard.html"
        }else{
            $('#submitUnit').value = "Error"
            setTimeout(() => $('#submitUnit').value = "Add Unit",2000);
        }
    }
}


function notesToJSON(){
    const noteList = $("#mainContentFlex").children;
    let notes = {};
    if (noteList.length != 0 ){
        for (let i in noteList){
            if (i == "length") break;
            let note = {
                title: noteList[i].querySelector('#nTitle').value,
                data: noteList[i].querySelector('.ql-editor').innerHTML
            }
            notes["note" + i] = note;
        }
    }
    $("#mainContentFlex").innerHTML = " ";
    return(notes);
}

function addTopicToList(tID){
    let notes = JSON.stringify(notesToJSON());
    let topic = {
        tName: $('#topicName').value,
        uID: $('#units').value,
        tOrder: currentUnit.currentTopic.tOrder,
        tLeader: $('#leader').value,
        tWeeks: $('#tWeeks').value,
        tNotes: notes
    }
    if(tID) topic.tID = tID;
    currentUnit.topics.push(topic);
    currentUnit.topics.sort((a,b) => a.tOrder - b.tOrder);
    fillTopics(currentUnit.topics);
}

function addEmptyTopic(){
    storeTopicChanges();
    $('#topicName').value = "New Topic";
    $('#leader').value = null;
    $('#tWeeks').value = 1;
    let topic = {
        tName: $('#topicName').value,
        uID: $('#units').value,
        tOrder: currentUnit.topics.length + 1,
        tleader: $('#leader').value,
        tWeeks: 1
    }
    currentUnit.topics.push(topic);
    currentUnit.currentTopic = topic;
}

async function saveTopics(){
    storeTopicChanges();
    let data = {
        uID: $('#units').value,
        topics: currentUnit.topics
    };
    let response = await callServer('/api/topics','PUT',data);
    fillNotes();
    fillInfobar(currentUnit.topics[0]);
    console.log(response);
}

async function getUnits(){
    let units = await callServer('/api/unit',"GET");
    return(units);
}

async function updateTest(){
    let unit = {
        title: $('#uName').value,
        sTitle: $('#uSName').value,
        desc: $('#uDesc').value,
        weeks: $('#uWeeks').value
    }
    let response = callServer('/api/unit?uID=6',"PUT",unit);
}

function addNote(){
    const newNote = window.note.content.cloneNode(true);
    let noteList = JSON.parse(currentUnit.currentTopic.tNotes);
    const nID = "note" + $('#mainContentFlex').childElementCount;
    const editor = newNote.querySelector("#editor");
    editor.id = "editor" + $('#mainContentFlex').childElementCount;
    newNote.querySelector('.contentBox').id = nID;
    newNote.querySelector('button').addEventListener('click',removeNote);

    let note = {
        title: null,
        data: null,
    }
    noteList[nID] = note;
    currentUnit.currentTopic.tNotes = JSON.stringify(noteList);

    $('#mainContentFlex').appendChild(newNote);
    let quill = new Quill(("#" + editor.id), {
      theme: 'snow'
    });
    return(newNote);
}

function removeNote(event){
    let note = event.target.parentNode;
    currentUnit.currentTopic
    note.remove();

}

function removeTopic(event){

    let cont =  confirm("Are you sure you want to delete this topic? Once a topic is deleted it cannot undone.");

    if(cont){
        if(currentUnit.currentTopic.tID != undefined){
            deleteTopic(currentUnit.unit.uID, currentUnit.currentTopic.tID);
        }

        currentUnit.topics = currentUnit.topics.filter(topic => topic.tID != currentUnit.currentTopic.tID);
        currentUnit.currentTopic = currentUnit.topics[0]
        fillInfobar(currentUnit.currentTopic);
        fillTopics(currentUnit.topics);
        $("#mainContentFlex").innerHTML = " ";
        fillNotes();
    }

}

async function deleteTopic(uID,tID){
    let data = {
        uID: uID,
        tID: tID
    }

    let response = await callServer('/api/topic','DELETE',data);

}


function fillNotes(){
    $('#mainContentFlex').innerHTML = "";
    let notes = JSON.parse(currentUnit.currentTopic.tNotes);
    for (let i in notes){
        let newNote = addNote();
        let nID = '#' + i;
        let note = $(nID);
        note.querySelector('#nTitle').value = notes[i].title;
        note.querySelector('.ql-editor').innerHTML = notes[i].data;
    }

}

function editUnit(){
    window.location.href = '/editUnit.html?uID=' + $('#units').value
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
