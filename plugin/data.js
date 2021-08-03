const languages = ["de", "en"];

const defaults = {
    multipleLangs: false,
    de: `aggressiv: attraktiv

amüsant: relevant
amüsanz: relevanz

ministerium: mysterium
ministerien: mysterien

bundestag: schützenverein

ironisch: erotisch
ironien: erotiken
ironie: erotik
ironiker: erotiker

problem: ekzem

kritisch: kryptisch
kritik: kryptik

provozier: produzier

arbeitnehmer: arbeitgeber
arbeitsnehmer: arbeitsgeber
`, en: `
aggressive: attraktiv
    
amusing: relevant
amusement: relevance
    
ministry: mystery
ministries: mysteries
    
problem: eczema

ironic: erotic
irony: erotica
erotica: erotics
    
critic: cryptic
criticism: cryptic
    
provocat: produce
    
employee: employer
`
};

const CONFIG_KEYS = Object.keys(defaults);

// removes comments (// or # or /* */) and parses config lowercase
function parseConfig(configStr) {
    const obj = {};

    configStr = configStr.toLowerCase().replaceAll(/\/\*[^/]*\*\//g, "");

    let currentlyInMultilineComment = false;
    let last = "";
    let startOfStatement = 0;
    for (let i = 0; i < configStr.length; i++) {
        let current = configStr[i];
        if (last === "\\") {
            if (current === "\\") {
                current = ""; // "\\" shouldn't escape
            }
        } else {
            switch (current) {
                case ";":
                case "\n": {
                    if (currentlyInMultilineComment) {
                        break; // do nothing
                    } else if (startOfStatement !== -1) { // if not in comment
                        handleLine(obj, configStr.substring(startOfStatement, i));
                    }
                    startOfStatement = i + 1;
                    break;
                }
                case "/": {
                    if (last === "/") {
                        // fall through to normal comment with #
                    } else {
                        if (last === "*") {
                            if (currentlyInMultilineComment) {
                                currentlyInMultilineComment = false;
                                startOfStatement = i + 1;
                            } else {
                                throw "invalid \"*/\"";
                            }
                        }
                        break;
                    }
                }
                case "#": { // comment
                    handleLine(obj, configStr.substring(startOfStatement, i));
                    startOfStatement = -1;
                    break;
                }
                case "*": {
                    if (last === "/") {
                        handleLine(obj, configStr.substring(startOfStatement, i - 1));
                        currentlyInMultilineComment = true;
                        startOfStatement = -1;
                    }
                    break;
                }
                case "\t":
                case " ": {
                    if (startOfStatement === i) {
                        startOfStatement = i + 1;
                    }
                    break;
                }
            }
        }
        last = current;
    }
    if (startOfStatement !== -1) {
        handleLine(obj, configStr.substring(startOfStatement, configStr.length + 1));
    }
    return obj;
}

function handleLine(obj, line) {
    if (line.length === 0) return;

    const words = line.split(/\s*:\s*/g);
    if (words.length < 2) {
        throw `"${line}" doesn't contain ":"`
    } else if (words.length > 2) {
        throw `"${line} is invalid`;
    } else {
        obj[words[0]] = words[1];
        obj[words[1]] = words[0];
    }
}

function objToStr(obj) {
    const strBuilder = [];

    const already = [];
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (!already.includes(key)) {
            already.push(key, obj[key]);
            strBuilder.push(`${key}: ${obj[key]}`);
        }
    }
    return strBuilder.join("\n");
}
