let keys;
let words;

const defaultJson = `{
    "aggressiv": "attraktiv",

    "amüsant": "relevant",
    "amüsanz": "relevanz",

    "ministerium": "mysterium",
    "ministerien": "mysterien",

    "bundestag": "schützenverein",

    "ironisch": "erotisch",
    "ironien": "erotiken",
    "ironie": "erotik",
    "ironiker": "erotiker",

    "problem": "ekzem",

    "kritisch": "kryptisch",
    "kritik": "kryptik",

    "provozier": "produzier",

    "arbeitnehmer": "arbeitgeber",
    "arbeitsnehmer": "arbeitsgeber"
}`;

chrome.storage.local.get({
    words: defaultJson
}, function(items) {
    let json = JSON.parse(items.words.toLowerCase());

    //load:
    if(json === undefined) json = JSON.parse(defaultJson);

    keys = Object.keys(json);
    for (let i = 0; i < keys.length; i++) {
        json[json[keys[i]]] = keys[i]; //value as key with old key as new value
    }
    words = json;
    keys = Object.keys(words);

    replaceVertauschteWoerter(document.body);
    document.title = replaceText(document.title);
});



function replaceVertauschteWoerter(e) {
    if(void 0 !== e && e && !(e.isContentEditable === !0|| null !== e.parentNode && e.parentNode.isContentEditable)){
        if(e.hasChildNodes()){
            const childes = e.childNodes;
            for(let n = 0; n < childes.length; n++) replaceVertauschteWoerter(childes[n])
        }
        if(3 === e.nodeType) e.nodeValue= replaceText(e.nodeValue);
    }
}

const observer = new MutationObserver(function (e) {
    const r = e.length;
    for (let t = 0; t < r; t++) {
        const n = e[t].addedNodes.length;
        for (let o = 0; o < n; o++) {
            replaceVertauschteWoerter(e[t].addedNodes[o])
        }
    }
});

observer.observe(document.body,{
    childList:!0,subtree:!0
});

function isText(val) {
    if (typeof val !== "string") return false;
    if (val.length === 0) return false;
    return val.replace(noTextRegex, "").length === 0;
}

function arrIsEmpty(arr) {
    if (!Array.isArray(arr)) return true;
    if (arr.length === 0) return true;
    for (const arrElement of arr) {
        if (arrElement.length > 0) {
            return false;
        }
    }
    return true;
}

const noTextRegex = /[^a-zA-ZÄÖÜäöü]+/gm;
const textRegex = /[a-zA-ZÄÖÜäöü]+/gm;
function replaceText(input) {
    if(input.length === 0) return "";

    const text = input.split(noTextRegex); // everything that isn't word

    if (arrIsEmpty(text)) {
        return input;
    }

    const notText = input.split(textRegex);  //everything that is word

    let noTextIndex = 0;
    let textIndex = 0;
    let out = "";

    if (!isText(input[0])) { // if not starts with text
        out = notText[0];
        noTextIndex++;

        if (text[0].length === 0) {
            textIndex = 1;
        }
    }

    for (; textIndex < text.length; textIndex++) {
        if(text[textIndex].length > 0) {
            let replacement = text[textIndex].toLowerCase();

            for (let j = 0; j < keys.length; j++) {
                if (replacement.indexOf(keys[j]) !== -1) {
                    replacement = replacement.replace(keys[j], words[keys[j]]);
                    break;
                }
            }

            if (replacement !== text[textIndex] && replacement .length > 0) {
                if (text[textIndex].toUpperCase() === text[textIndex]) { //checks if string is uppercase
                    replacement = replacement.toUpperCase();
                } else {
                    const firstLetterOfText = text[textIndex].charAt(0);
                    if (firstLetterOfText.toUpperCase() === firstLetterOfText) { //checks if first letter is uppercase
                        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1); //sets first letter uppercase, to match case with the original word
                    }
                }
            }

            out += replacement;
        }
        if (noTextIndex < notText.length) {
            out += notText[noTextIndex];
            noTextIndex += 1;
        }
    }
    for (; noTextIndex < notText.length; noTextIndex++) {
        out += notText[noTextIndex];
    }
    return out;
}
