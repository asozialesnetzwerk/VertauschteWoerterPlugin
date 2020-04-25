let json  = {
    "aggressiv": "attraktiv",
    "aggressivst": "attraktivst",
    "aggressivität": "attraktivität",

    "amüsant": "relevant",
    "amüsanz": "relevanz",

    "ministerium": "mysterium",
    "ministeriums": "mysteriums",
    "ministerien": "mysterien",

    "bundestag": "schützenverein",
    "bundestags": "schützenvereins",

    "ironisch": "erotisch",
    "ironie": "erotik",

    "problem": "ekzem",
    "problems": "ekzems",

    "kritisch": "kryptisch",
    "kritischst": "kryptischst",
    "kritik": "kryptik",

    "provozieren": "produzieren",
    "provoziert": "produziert",

    "arbeitnehmer": "arbeitgeber",
    "arbeitsnehmers": "arbeitgebers"
};

const keys = Object.keys(json);
for (let i = 0; i < keys.length; i++) {
    json[json[keys[i]]] = keys[i]; //value as key with old key as new value
}
const words = json;

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
        let replacement = words[text[i].toLocaleLowerCase()];
        if(replacement === undefined) {
            replacement = text[i];

            const e = text[i].toLocaleLowerCase().lastIndexOf('e');
            if(e > 0) {
                let replacement2 = words[text[i].substr(0, e).toLocaleLowerCase()];
                if(replacement2 === undefined) {
                    replacement2 = words[text[i].substr(0, e + 1).toLocaleLowerCase()];
                }
                if(replacement2 !== undefined) {
                    replacement = replacement2 + text[i].substr(e);
                }
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