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

    "arbeitnehmer": "arbeitgeber",
    "arbeitsnehmer": "arbeitsgeber"
}`;

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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    // Use default value words = defaultJson.
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
