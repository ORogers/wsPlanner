'use strict';

window.onload = function() {
    loadAddPage();
    $('#submitUnit').addEventListener('click',sendUnit);
    $('#signOut').addEventListener('click',signOut)
};

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

function loadAddPage(){
    let user = JSON.parse(localStorage.upUser)
    $("#userPhoto").src = user.Paa
    $(".g-signin2").style.display = "none";
}
