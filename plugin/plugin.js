let keys;
let words;
fetch("defaultWords.json")
    .then(function(response) {
            response.text().then(load);
        }, function (error) {
            error.then(console.log);
        }
    );


function load(defaultJson) {
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
    if(input.length === 0) return "";

    const text = input.split(/[^a-zA-ZÄÖÜäöü]+/); // everything that isn't word
    const notText = input.split(/[a-zA-ZÄÖÜäöü]+/);  //everything that is word


    const startsWithText = text[0].length > 0;

    function getNextTextPart(index, replacedText) {
        let str = "";
        if(startsWithText) {
            str += replacedText;
            if(index + 1 < notText.length) str += notText[index + 1];
        } else {
            if(index - 1 < notText.length) str += notText[index - 1];
            str += replacedText;
        }
        return str;
    }

    let out = "";
    for (let i = startsWithText ? 0 : 1; i < text.length; i++) {
        if(text[i].length > 0) {
            let replacement = text[i].toLowerCase();

            for (let j = 0; j < keys.length; j++) {
                if (replacement.indexOf(keys[j]) !== -1) {
                    replacement = replacement.replace(keys[j], words[keys[j]]);
                    break;
                }
            }

            if (replacement !== text[i] && replacement .length > 0) {
                if (text[i].toUpperCase() === text[i]) { //checks if string is uppercase
                    replacement = replacement.toUpperCase();
                } else {
                    const firstLetterOfText = text[i].charAt(0);
                    if (firstLetterOfText.toUpperCase() === firstLetterOfText) { //checks if first letter is uppercase
                        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1); //sets first letter uppercase, to match case with the original word
                    }
                }
            }

            out += getNextTextPart(i, replacement);
        }
    }
    return out;
}