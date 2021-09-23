chrome.storage.local.get(["config"], function(items) {
    if (typeof items.config == "string") {
        startReplacing(items.config)
    } else {
        startReplacing(defaultConfig)
    }
});

async function startReplacing(config) {
    const swObj = await setupPyode();
    swObj.setConfig(config)

    console.log()

    document.title = swObj.swapWords(document.title);
    await replaceVertauschteWoerter(document.body, swObj);

    console.log(4, new Date())


    const observer = new MutationObserver(function (e) {
        const r = e.length;
        for (let t = 0; t < r; t++) {
            const n = e[t].addedNodes.length;
            for (let o = 0; o < n; o++) {
                replaceVertauschteWoerter(e[t].addedNodes[o], swObj)
            }
        }
    });

    observer.observe(document.body,{
        childList:!0,subtree:!0
    });
}

async function replaceVertauschteWoerter(e, swObj) {
    if(void 0 !== e && e && !(e.isContentEditable === !0|| null !== e.parentNode && e.parentNode.isContentEditable)){
        if (e.tagName !== "TEXTAREA" && e.tagName !== "SCRIPT") {
            if (e.hasChildNodes()) {
                const childes = e.childNodes;
                for (let n = 0; n < childes.length; n++) replaceVertauschteWoerter(childes[n], swObj)
            }
            if (3 === e.nodeType) e.nodeValue = swObj.swapWords(e.nodeValue);
        }
    }
}
