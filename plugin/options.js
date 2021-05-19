const elements = [];
const multipleLangsCheckBox = document.getElementById("multiple-langs");

for (const lang of languages) {
    elements.push(document.getElementById("text_input_" + lang));
}

function saveOptions() {
    const obj = {};
    for (let i = 0; i < languages.length; i++) {
        obj[languages[i]] = elements[i].value;
    }
    obj["multipleLangs"] = multipleLangsCheckBox.checked;
    save(obj);
}

function save(obj) {
    for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        try {
            JSON.parse(obj[lang]);
        } catch (e) {
            updateStatus(`Ein Fehler ist beim Parsen der Wörter in ${lang} aufgetreten: "${e.toString()}"`);
            return;
        }
    }

    chrome.storage.local.set(obj, function () {
        // Update status to let user know options were saved
        updateStatus("Optionen gespeichert.");
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
    chrome.storage.local.get(defaults, function(items) {
        for (let i = 0; i < languages.length; i++) {
            elements[i].value = items[languages[i]];
        }
        CheckBox.checked = items["multipleLangs"];
    });
}

function resetOptions() {
    save(defaults);
    restoreOptions();
}

document.addEventListener("Domcontentloaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
document.getElementById("reset").addEventListener("click", resetOptions);

restoreOptions();
