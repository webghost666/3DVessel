export let isArray = (c) => {
    return Array.isArray ? Array.isArray(c) : c instanceof Array;
}

export let extend = (base, newObj) => {
    let key,
        obj = JSON.parse(JSON.stringify(base));
    
    if (newObj) { 
        for(key in newObj) {
            if (Object.prototype.hasOwnProperty.call(newObj, key) && 
                Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj[key] = newObj[key];
            }
        }
    }
    return obj;
};

export let  sortNumeric = (a, b) => { return a - b; }

export let trimString = (s, start = true, end = true) => {
    let sTrimmed = s;
    if (start) { sTrimmed = sTrimmed.replace(/^\s\s*/, ''); }
    if (end) { sTrimmed = sTrimmed.replace(/\s\s*$/, ''); }
    return sTrimmed;
}

export let arrayToSet = (arr) => {
    let j, lenJ, outputSet = new Set();
    for (j = 0, lenJ = arr.length; j < lenJ; j += 1) {
        let clazzName = trimString(arr[j]);
        if (!outputSet.has(clazzName)) {
            outputSet.add(clazzName);
        }
    }
    return ouputSet;
}

export let objKeysToArray = (obj, sortN) => {
    let key, arr = [];
    for(key in obj) {
        arr.push(key);
    }
    if (sortN) {
        arr = arr.sort(sortNumeric);
    }
    return arr;
} 

export let decimalToHex = (d) => {
    let hex = Number(d).toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    return hex.toUpperCase();
}

export let pad = (num, size) => {
    let s = "000" + String(num);
    return s.substr(s.length - size);
}

export let getQueryParams = () => {
    let qs = document.location.search.split('+').join(' '),
        params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
}
