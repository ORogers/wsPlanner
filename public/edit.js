'use strict';

window.onload = function() {
    loadEditPage();
    $('#saveEdits').addEventListener('click',updateUnit);

};

function urlToID(){
    let url = new URL(window.location.href);
    let uID = url.searchParams.get("uID");
    return(uID);
}


async function getUnitDetails(){
    let url = '/api/unit?uID=' + urlToID();
    let unit = await callServer(url,'GET');
    return(unit.unit[0]);
}

async function loadEditPage(){
    let user = JSON.parse(localStorage.upUser)
    $("#userPhoto").src = user.Paa
    $(".g-signin2").style.display = "none";
    let unit = await getUnitDetails();

    $('#uName').value = unit.uTitle;
    $('#uSName').value = unit.uShortTitle;
    $('#uDesc').value = unit.uDesc;
    $('#uWeeks').value = unit.uWeeks;

}

async function updateUnit(){
    $('#saveEdits').value ="Saving Changes..."
    let unit = {
        title: $('#uName').value,
        sTitle: $('#uSName').value,
        desc: $('#uDesc').value,
        weeks: $('#uWeeks').value
    }

    let url = '/api/unit?uID=' + urlToID();
    let res = await callServer(url,"PUT",unit);

    if(res.response == "OK"){
        $('#saveEdits').value ="Changes Saved";
        setTimeout(()=> $('#saveEdits').value ="Save Edits", 3000);
    }else{
        $('#saveEdits').value ="Error Try Again";
        setTimeout(() => $('#saveEdits').value ="Save Edits", 3000);
    }

}
