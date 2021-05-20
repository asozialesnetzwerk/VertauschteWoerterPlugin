let keys;
let words;


const lang = stringToLanguage(document.getElementsByTagName("html")[0].lang);

chrome.storage.local.get(defaults, function(items) {
    const langStr = items["multipleLangs"] ? getLanguageString() : "de";
    const defaultConfig = defaults[langStr];

    try {
        words = parseConfig(items[langStr]);
    } catch (e) {
        if (typeof defaultConfig[langStr] !== "undefined") {
            // lang is valid
            try { // for migration to new config type
                words = JSON.parse(items[langStr]);
                items[langStr] = objToStr(words);

                chrome.storage.local.set(items, () => {});
            } catch (e2) { /* something went wrong */}
        }
    }

    //load:
    if(typeof words === "undefined") words = parseConfig(defaultConfig);

    keys = Object.keys(words);

    // sort from long to short to replace the longer once with higher priority
    keys.sort((a,b) => b.length - a.length);

    replaceVertauschteWoerter(document.body);
    document.title = replaceText(document.title);
});

function getLanguageString() {
    return languages[lang];
}

function stringToLanguage(langStr) {
    if (typeof langStr !== "string") {
        return -1;
    }
    langStr = langStr.toLowerCase();

    for (let i = 0; i < languages.length; i++) {
        if (langStr.indexOf(languages[i]) !== -1) {
            return i;
        }
    }
    return -1;
}

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

const noTextRegex = /[^a-zA-ZÄÖÜäöüßẞ]+/gm;
const textRegex = /[a-zA-ZÄÖÜäöüßẞ]+/gm;
function replaceText(input) {
    if(!input || input.length === 0) return "";

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
            out += replaceWord(text[textIndex]);
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

function strIsUppercase(str) {
    return str.toUpperCase() === str;
}

function replaceWord(word) {
    if(!word || word.length === 0) return "";

    let replaced = false;

    let replacement = word.toLowerCase();

    for (let j = 0; j < keys.length; j++) {
        const index = replacement.indexOf(keys[j]);
        if (index !== -1) {
            replaced = true;
            replacement = replaceWord(replacement.slice(0, index)) + words[keys[j]] + replaceWord(replacement.slice(index + keys[j].length));
            break;
        }
    }

    if(replaced) {
        if (strIsUppercase(word)) { //checks if string is uppercase
            replacement = replacement.toUpperCase();
        } else {
            if (strIsUppercase(word.charAt(0))) { //checks if first letter is uppercase
                replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1); //sets first letter uppercase, to match case with the original word
            }
        }
        return replacement;
    }
    return word;
}
