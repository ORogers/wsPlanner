'use strict';

window.onload = function() {
    if(localStorage.upUser == undefined) window.location.href = "/index.html"
    fillDashboard();
    $('#moreUnitInfo').addEventListener('click',editUnit);
    $('#saveTopics').addEventListener('click',saveTopics);
    $('#deleteTopic').addEventListener('click',removeTopic);
    $('#addNote').addEventListener('click',addNote);
};


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

    unitList.add(document.createElement("option"));

    let addNewOp = document.createElement("option");
    addNewOp.text = "Add new unit";
    addNewOp.value = "+";
    unitList.add(addNewOp);

    unitList.addEventListener("change", unitChanged);
    //loads first unit as default
    if(units.length > 0){
        loadUnit(units[0].uID);
    }

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
        li.id = "t" + topic.tID;
        topicsList.appendChild(li);
    }
    let li = document.createElement("li");
    li.innerHTML = "+";
    li.addEventListener('click',addEmptyTopic)
    topicsList.appendChild(li);
}

function unitChanged(event){
    if (event.target.value == "") return;
    if (event.target.value == "+"){
        document.location.href = '/addUnit.html';
    }else{
        loadUnit(event.target.value);
    }
}

async function loadUnit(uID){
    if(currentUnit != {}) saveTopics();
    let url = '/api/unit?uID=' + uID;
    let unit = await callServer(url,'GET');
    console.log(unit);
    currentUnit.topics = unit.topics.sort((a,b) => a.tOrder - b.tOrder);
    currentUnit.unit = unit.unit[0];
    currentUnit.currentTopic = unit.topics[0];
    fillTopics(currentUnit.topics);
    fillInfobar(currentUnit.topics[0]);
    $("#mainContentFlex").innerHTML = " ";
    fillNotes();
}

function setCurrentTopic(event){
    storeTopicChanges();
    currentUnit.currentTopic = (currentUnit.topics.filter(topic => topic.tName == event.target.textContent))[0];
    fillInfobar(currentUnit.currentTopic);
    $("#mainContentFlex").innerHTML = " ";
    fillNotes();
}

function storeTopicChanges(){
    currentUnit.topics = currentUnit.topics.filter(topic => topic.tID != currentUnit.currentTopic.tID);
    addTopicToList(currentUnit.currentTopic.tID);
}


function fillInfobar(topic){
    $('#unitTitle').textContent = currentUnit.unit.uTitle;
    $('#topicName').value = topic.tName;
    $('#tWeeks').value = topic.tWeeks;

}

let source;
function dragStarted(evt){
    //start drag
    source=evt.target;
    //set data
    evt.dataTransfer.setData("text/plain", evt.target.innerHTML);
    //specify allowed transfer
    evt.dataTransfer.effectAllowed = "move";
}

function draggingOver(e){
    //drag over
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

function dropped(evt){
    //drop
    evt.preventDefault();
    evt.stopPropagation();
    //change text in dragged topic
    source.innerHTML = evt.target.innerHTML;
    let valueHolder = source.getAttribute("value")
    let hightHolder = source.style.height
    let idHolder = source.id
    source.setAttribute("value",evt.target.value);
    source.style.height = evt.target.style.height;
    source.id = evt.target.id;
    evt.target.setAttribute("value",valueHolder);
    evt.target.style.height = hightHolder;
    evt.target.id = idHolder;
    //update text in target topic
    evt.target.innerHTML = evt.dataTransfer.getData("text/plain");
    saveTopicOrders();
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
        tWeeks: $('#tWeeks').value,
        tNotes: notes
    }
    if(tID) topic.tID = tID;
    currentUnit.topics.push(topic);
    currentUnit.topics.sort((a,b) => a.tOrder - b.tOrder);
    fillTopics(currentUnit.topics);
}

function saveTopicOrders(){
    for(let topic of currentUnit.topics){
        topic.tOrder = calcTopicOrder(topic.tID)
    }
}


function calcTopicOrder(tID){
    let topic = $("#t"+tID);
    let topicList = Array.prototype.slice.call( $('#topicList').children );
    return topicList.indexOf(topic);
}

function addEmptyTopic(){
    storeTopicChanges();
    $('#topicName').value = "New Topic";
    $('#tWeeks').value = 1;
    let topic = {
        tName: $('#topicName').value,
        uID: $('#units').value,
        tOrder: currentUnit.topics.length + 1,
        tWeeks: 1
    }
    currentUnit.topics.push(topic);
    currentUnit.currentTopic = topic;
}

async function saveTopics(){
    if(currentUnit.topics != undefined){
        saveTopicOrders();
        storeTopicChanges();
        let data = {
            uID: $('#units').value,
            topics: currentUnit.topics
        };
        let response = await callServer('/api/topics','PUT',data);
        fillNotes();
        fillInfobar(currentUnit.topics[0]);
    }
}

async function getUnits(){
    let units = await callServer('/api/unit',"GET");
    return(units);
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

    let cont =  confirm(`Are you sure you want to delete this topic? Once a
                        topic is deleted it cannot undone.`);

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
