const defaultJson = `{
    "aggressiv": "attraktiv",

    "amüsant": "relevant",
    "amüsanz": "relevanz",

    "ministerium": "mysterium",
    "ministerien": "mysterien",

    "bundestag": "schützenverein",

    "ironisch": "erotisch",
    "ironien": "erotiken",
    "ironie": "erotik",
    "ironiker": "erotiker",

    "problem": "ekzem",

    "kritisch": "kryptisch",
    "kritik": "kryptik",

    "provozier": "produzier",

    "arbeitnehmer": "arbeitgeber"
}`;
const status = document.getElementById("status");


function saveOptions() {
    save(document.getElementById("text_input").value);
}

function save(value) {
    try {
        JSON.parse(value);
    } catch(e) {
        status.innerText = "An error occured: " + e.toString();


        resetStatusTimed();
        return;
    }

    chrome.storage.local.set({
        words: value
    }, function () {
        // Update status to let user know options were saved
        status.innerText = "Options saved.";

        resetStatusTimed();
    });
}

function resetStatusTimed() {
    setTimeout(function() {
        status.innerText = "";
    }, 1500);
}

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

document.addEventListener("Domcontentloaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
document.getElementById("reset").addEventListener("click", resetOptions);


restoreOptions();