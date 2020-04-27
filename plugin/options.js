fetch("defaultWords.json")
    .then(function(response) {
            response.text().then(load);
        }, function (error) {
            error.text().then(console.log);
        }
    );

function saveOptions() {
    save(document.getElementById("text_input").value);
}

function save(value) {
    try {
        JSON.parse(value);
    } catch(e) {
        updateStatus("An error occurred: " + e.toString());
        return;
    }

    chrome.storage.local.set({
        words: value
    }, function () {
        // Update status to let user know options were saved
        updateStatus("Options saved.");
    });
}

function updateStatus(text) {
    const status = document.getElementById("status");
    status.innerText = text;

    setTimeout(function() {
        status.innerText = "";
    }, 1500);
}


let defaultJson;
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    // Use default value words = standartJson.
    chrome.storage.local.get({
        words: defaultJson
    }, function(items) {
        document.getElementById("text_input").value = items.words;
    });
}

function resetOptions() {
    save(defaultJson);
    restoreOptions();
}

function load(defaultWords) {
    defaultJson = defaultWords;

    document.addEventListener("Domcontentloaded", restoreOptions);
    document.getElementById("save").addEventListener("click", saveOptions);
    document.getElementById("reset").addEventListener("click", resetOptions);

    restoreOptions();
}