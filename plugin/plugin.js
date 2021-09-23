

async function startReplacing() {
    replaceText(document.title, (text) => {document.title = text;})
    await replaceVertauschteWoerter(document.body);

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
}

async function replaceVertauschteWoerter(e) {
    if(void 0 !== e && e && !(e.isContentEditable === !0|| null !== e.parentNode && e.parentNode.isContentEditable)){
        if (e.tagName !== "TEXTAREA" && e.tagName !== "SCRIPT") {
            if (e.hasChildNodes()) {
                const childes = e.childNodes;
                for (let n = 0; n < childes.length; n++) replaceVertauschteWoerter(childes[n])
            }
            if (3 === e.nodeType) replaceText(e.nodeValue, (text) => {e.nodeValue = text;});
        }
    }
}


function replaceText(text, handleResponse) {
    console.log(text);
    resp = chrome.runtime.sendMessage(
        text
    ).then(handleResponse, (err) => {
        console.error(err);
    });
}

startReplacing()
