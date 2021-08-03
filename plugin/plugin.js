let words;
let words_regex;


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

    // sort from long to short to replace the longer once with higher priority
    keys.sort((a,b) => b.length - a.length);

    words_regex = new RegExp("(" + Object.keys(words).join("|") + ")", "iu")

    replaceVertauschteWoerter(document.body);
    document.title = replaceText(document.title);
});

function getLanguageString() {
    return languages[lang];
}

function stringToLanguage(langStr) {
    if (typeof langStr !== "string") {
        return 0; // de as default
    }
    langStr = langStr.toLowerCase();

    for (let i = 0; i < languages.length; i++) {
        if (langStr.indexOf(languages[i]) !== -1) {
            return i;
        }
    }
    return 0; // de as default
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


function replaceText(input) {
    return input.replace(words_regex, (word) => {
        const replacedWord = words[word.toLowerCase()]

        if (word.length === 0) {
            return replacedWord;
        }

        if (strIsUppercase(word)) {
            return replacedWord.toUpperCase();
        }

        if (strIsUppercase(word[0])) {
            return replacedWord[0].toUpperCase() + replacedWord.substr(1);
        }

        return replacedWord;
    })
}

function strIsUppercase(str) {
    return str.toUpperCase() === str;
}
