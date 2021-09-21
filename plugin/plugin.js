// key (word to replace): value (replacement)
let REPLACEMENT_OBJ;
// regex to match all words
let WORDS_REGEX;
// count of groups in the words regex:
let GROUP_COUNT;
// array of words strings to replace:
let WORDS;


const lang = stringToLanguage(document.getElementsByTagName("html")[0].lang);

chrome.storage.local.get(CONFIG_KEYS, function(items) {
    if (!items) {
        items = defaults;
    }

    const langStr = items["multipleLangs"] ? getLanguageString() : "de";
    const defaultConfig = defaults[langStr];

    try {
        REPLACEMENT_OBJ = parseConfig(items[langStr]);
    } catch(e) {
        console.error(e);
        REPLACEMENT_OBJ = parseConfig(defaults[langStr]);
    }

    //load:
    if(typeof REPLACEMENT_OBJ === "undefined") REPLACEMENT_OBJ = parseConfig(defaultConfig);

    // sort from long to short to replace the longer once with higher priority
    WORDS = Object.keys(REPLACEMENT_OBJ)
    WORDS.sort((a,b) => b.length - a.length);
    const words_as_named_groups = []
    for (let i = 0; i < WORDS.length; i++) {
        words_as_named_groups.push(`\(\?<word${i}>${WORDS[i]})`)
    }
    const regex_str = words_as_named_groups.join("|")
    WORDS_REGEX = new RegExp(regex_str, "gui");

    GROUP_COUNT = (new RegExp(regex_str + '|')).exec('').length - 1;

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
        if (e.tagName !== "TEXTAREA" && e.tagName !== "SCRIPT") {
            if (e.hasChildNodes()) {
                const childes = e.childNodes;
                for (let n = 0; n < childes.length; n++) replaceVertauschteWoerter(childes[n])
            }
            if (3 === e.nodeType) e.nodeValue = replaceText(e.nodeValue);
        }
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
    return input.replace(WORDS_REGEX, replaceWord)
}

function replaceWord(match) {
    let replacedWord;

    // groups object
    const groups = arguments[GROUP_COUNT + 3];

    for (let [key, value] of Object.entries(groups)) {
        if (typeof value == "string") {
            replacedWord = REPLACEMENT_OBJ[
                WORDS[key.substr("word".length)]
                ];
            break;
        }
    }

    if (typeof replacedWord === "undefined") {
        replacedWord = REPLACEMENT_OBJ[match.toLowerCase()];
        if (typeof replacedWord === "undefined") {
            return match
        }
    }

    const word_split = match.split(" ");
    const replacement_split = replacedWord.split(" ");
    if (word_split.length === replacement_split.length) {
        for (let i = 0; i < word_split.length; i++) {
            replacement_split[i] = adaptCase(word_split[i], replacement_split[i]);
        }
        return replacement_split.join(" ")
    }
    return adaptCase(match, replacedWord);
}

function strIsUppercase(str) {
    return str.toUpperCase() === str;
}

function adaptCase(word, replacedWord) {
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
}
