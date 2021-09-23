chrome.storage.local.get(["config"], function(items) {
    if (typeof items.config == "string") {
        startReplacing(items.config)
    } else {
        startReplacing(defaultConfig)
    }
});

async function startReplacing(config) {
    const pyodide = await getPyodide(config);
    document.title = pyodide.swapWords(document.title);
    await replaceVertauschteWoerter(document.body, pyodide);

    console.log(4, new Date())


    const observer = new MutationObserver(function (e) {
        const r = e.length;
        for (let t = 0; t < r; t++) {
            const n = e[t].addedNodes.length;
            for (let o = 0; o < n; o++) {
                replaceVertauschteWoerter(e[t].addedNodes[o], pyodide)
            }
        }
    });

    observer.observe(document.body,{
        childList:!0,subtree:!0
    });
}

async function replaceVertauschteWoerter(e, pyodide) {
    if(void 0 !== e && e && !(e.isContentEditable === !0|| null !== e.parentNode && e.parentNode.isContentEditable)){
        if (e.tagName !== "TEXTAREA" && e.tagName !== "SCRIPT") {
            if (e.hasChildNodes()) {
                const childes = e.childNodes;
                for (let n = 0; n < childes.length; n++) await replaceVertauschteWoerter(childes[n], pyodide)
            }
            if (3 === e.nodeType) e.nodeValue = pyodide.swapWords(e.nodeValue);
        }
    }
}
