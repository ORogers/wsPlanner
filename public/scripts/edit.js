'use strict';

window.onload = function() {
    loadEditPage();
    $('#saveEdits').addEventListener('click',updateUnit);
    $('#deleteUnit').addEventListener('click',deleteUnit);

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
    if(unit){
        $('#uName').value = unit.uTitle;
        $('#uSName').value = unit.uShortTitle;
        $('#uDesc').value = unit.uDesc;
        $('#uWeeks').value = unit.uWeeks;
    }else{
        window.location.href = "/dashboard.html";
    }


}

async function updateUnit(){
    if(validateAddUnit()){
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
            setTimeout(()=> $('#saveEdits').value ="Save Edits", 2000);
        }else{
            $('#saveEdits').value ="Error Try Again";
            setTimeout(() => $('#saveEdits').value ="Save Edits", 2000);
        }
    }
}

async function deleteUnit(){
    let cont = confirm("Are you sure you want to delete this unit?\nOnce a unit has been deleted it and its topics cannot be recoverd.")
    if(cont){
        let url = '/api/unit?uID=' + urlToID();
        let res = await callServer(url,"DELETE");

        if(res.response == "OK"){
            window.location.href = "/dashboard.html";
        }else{
            $('#deleteUnit').value ="Error Deleting, Try Again";
            setTimeout(() => $('#saveEdits').value ="Delete Unit", 2000);
        }
    }

}
