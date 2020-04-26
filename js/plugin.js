let json  = {
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
};

let keys = Object.keys(json);
for (let i = 0; i < keys.length; i++) {
    json[json[keys[i]]] = keys[i]; //value as key with old key as new value
}
const words = json;
keys = Object.keys(words);

function replaceVertauschteWoerter(e){
    if(void 0!== e && e &&!(e.isContentEditable===!0||null!==e.parentNode&&e.parentNode.isContentEditable)){
        if(e.hasChildNodes()){
            var r = e.childNodes,
                t=r.length,n=0;
            for(n;n<t;n++) replaceVertauschteWoerter(r[n])
        }
        3==e.nodeType&&(e.nodeValue= replaceText(e.nodeValue))
    }
}

replaceVertauschteWoerter(document.body),
    document.title = replaceText(document.title);

var observer = new MutationObserver(function (e) {
    var r = e.length, t = 0;
    for (t; t < r; t++) {
        var n = e[t].addedNodes.length, o = 0;
        for (o; o < n; o++) {
            var a = e[t].addedNodes[o];
            replaceVertauschteWoerter(a)
        }
    }
});

observer.observe(document.body,{
    childList:!0,subtree:!0
});

function firstLetterIsUpperCase(str) {
    if(str.length === 0) return false;
    const firstLetter = str.substr(0, 1);
    return firstLetter.toLocaleUpperCase() === firstLetter;
}

function stringIsUpperCase(str) {
    return str.toUpperCase() === str;
}

function setFirstLetterUpperCase(str) {
    if(str.length === 0) return str;
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function replaceText(input) {
    if(input === "") return "";

    const text = input.split(/[^a-zA-ZÄÖÜäöü]+/); // everything that isn't word
    const not_text = input.split(/[a-zA-ZÄÖÜäöü]+/);  //everything that is word


    const starts_with_text = text[0].length > 0;

    function getNextTextPart(index, replacedText) {
        let str = "";
        if(starts_with_text) {
            str += replacedText;
            if(index + 1 < not_text.length) str += not_text[index + 1];
        } else {
            if(index - 1 < not_text.length) str += not_text[index - 1];
            str += replacedText;
        }
        return str;
    }

    let out = "";

    for (let i = starts_with_text ? 0 : 1; i < text.length; i++) {
        let replacement = text[i].toLowerCase();
        console.log(replacement);

        for (let j = 0; j < keys.length; j++) {
            if(replacement.indexOf(keys[j]) !== -1) {
                replacement = replacement.replace(keys[j], words[keys[j]]);
                break;
            }
        }

        if(replacement !== text[i]) {
            if (stringIsUpperCase(text[i])) {
                replacement = replacement.toUpperCase();
            } else if (firstLetterIsUpperCase(text[i])) {
                replacement = setFirstLetterUpperCase(replacement);
            }
        }

        out += getNextTextPart(i, replacement);
    }


    return out;
}