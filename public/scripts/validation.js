'use strict';

function validateUName(){
    let errors = "";
    let name = $('#uName').value;

    if(!(/\S/.test(name))) errors += "Unit name must not be blank\n";
    if(name.length > 60) errors += "Unit name must not be longer the 60 characters\n";

    return errors;
}

function validateUSName(){
    let errors = "";
    let sName = $('#uSName').value;

    if(!(/\S/.test(sName))) errors += "Unit short name must not be blank\n";
    if(sName.length > 60) errors += "Unit short name must not be longer the 60 characters\n";

    return errors;
}

function validateDesc(){
    let errors = "";
    let desc = $('#uDesc').value;

    if(!(/\S/.test(desc))) errors += "Description must not be blank\n";
    if(desc.length > 500) errors += "Description must not be longer the 500 characters\n";

    return errors;
}

function validateWeeks(){
    let errors = "";
    let weeks = $('#uWeeks').value;

    if(weeks < 1 || weeks > 52) errors += "Weeks must be above 1 and less than 52";

    return errors
}

function validateAddUnit(){
    let errors = "";
    let checks = [validateUName,validateUSName,validateDesc,validateWeeks];
    for(let i in checks){
        errors += checks[i]();
    }
    if(errors.length > 0){
        alert(errors);
        return false;
    }else{
        return true;
    }
}
