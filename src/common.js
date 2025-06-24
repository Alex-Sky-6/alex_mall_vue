export function getCurDate(){
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let date = d.getDate();

    month = month < 10 ? '0' + month : month;
    date = date < 10 ? '0' + date : date;

    return `${year}-${month}-${date}`
}

export function setSessionStorage(key, value){
    sessionStorage.setItem(key, JSON.stringify(value));
}

export function getSessionStorage(key){
    let str = sessionStorage.getItem(key);
    if(str==''||str=='null'||str===undefined){
        return null;
    }else{
        return JSON.parse(str);
    }
}

export function removeSessionStorage(key){
    sessionStorage.removeItem(key);
}

export function setLocalStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorage(key){
    let str = localStorage.getItem(key);
    if(str==''||str=='null'||str===undefined){
        return null;
    }else{
        return JSON.parse(str);
    }
}

export function removeLocalStorage(key){
    localStorage.removeItem(key);
}