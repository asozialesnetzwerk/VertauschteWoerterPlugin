async function startReplacing() {
    console.log(new Date())
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
    console.log(new Date())
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
    // "http://localhost:8080/vertauschte-woerter/api/"
    fetch("http://localhost:8080/vertauschte-woerter/api/", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        //make sure to serialize your JSON body
        body: JSON.stringify({
            text: text
        })
    }).then( (response) => {
        console.log(response)
        response.json().then((json) => {
            console.log(json)
            handleResponse(json["replaced_text"])
        }).catch((err) => {
            console.error(err);
        });
    }).catch((err) => {
        console.error(err);
    });
}

startReplacing()
