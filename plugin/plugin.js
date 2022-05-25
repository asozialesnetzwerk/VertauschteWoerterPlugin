// key (word to replace): value (replacement)
let REPLACEMENT_OBJ;
// regex to match all words
let WORDS_REGEX;
// count of groups in the words regex:
let GROUP_COUNT;
// array of words strings to replace:
let WORDS;

(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("veaction") === "edit"
        || params.get("action") === "edit"
        || params.get("action") === "submit") {
        throw "Don't replace while editing stuff.";
    }
})();

const lang = stringToLanguage(document.getElementsByTagName("html")[0].lang);

const observer = new MutationObserver(function (e) {
    const r = e.length;
    for (let t = 0; t < r; t++) {
        const n = e[t].addedNodes.length;
        for (let o = 0; o < n; o++) {
            replaceOnNode(e[t].addedNodes[o])
        }
    }
});

chrome.storage.local.get(CONFIG_KEYS, function(items) {
    if (!items) {
        items = defaults;
    }

    const langStr = items["multipleLangs"] ? getLanguageString() : "de";
    const defaultConfig = defaults[langStr];

    if (typeof items[langStr] !== "string") {
        REPLACEMENT_OBJ = parseConfig(defaultConfig);
        console.debug("Using default config, as nothing is saved.")
    } else {
        try {
            REPLACEMENT_OBJ = parseConfig(items[langStr]);
        } catch(e) {
            console.error("Saved config is invalid.", e);
            REPLACEMENT_OBJ = parseConfig(defaultConfig);
        }
    }
    console.debug(REPLACEMENT_OBJ)

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

    document.title = replaceText(document.title);
    replaceOnNode(document.body);
    console.debug("finished initial word swapping");

    observer.observe(document.body,{
      childList: true, subtree: true
    });

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

function replaceOnNode(node) {
    const queue = [node];
    while (queue.length > 0) {
        try {
            node = queue.pop();

            if (
                node !== undefined && node
                // do not replace if users can edit the content of e
                && !node.isContentEditable
                && (null === node.parentNode || !node.parentNode.isContentEditable)
                && String(node.tagName).toUpperCase() !== "TEXTAREA"
                && String(node.tagName).toUpperCase() !== "SCRIPT"
            ) {
                for (const child of node.childNodes)
                    queue.push(child);

                if (node.TEXT_NODE === node.nodeType)
                    node.nodeValue = replaceText(node.nodeValue);
            }
        } catch (e) {
            console.error(e);
        }
    }
}


function replaceText(input) {
    if (typeof input !== "string")
        return input;
    return input.replace(WORDS_REGEX, replaceWord)
}

function replaceWord(match) {
    let replacedWord;
    //console.debug(match);

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
