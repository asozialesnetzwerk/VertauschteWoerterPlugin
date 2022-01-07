const languages = ["de", "en"];

const defaults = {
    multipleLangs: false,
    de: `# "<=>" heißt, dass die Wörter mit einander vertauscht werden sollen.
# "=>" heißt, dass das erste Wort durch das zweite Wort ersetzt werden soll.
# Das zu ersetzende Wort kann Regex-Syntax enthalten und muss ein valides Regex sein.
# Achtung: Alle Buchstaben werden als Kleinbuchstaben interpretiert und Leerzeichen vor und nach Wörtern werden entfernt.


aggressiv <=> attraktiv

amüsant <=> relevant
amüsanz <=> relevanz

arbeitnehmer <=> arbeitgeber
arbeitsnehmer <=> arbeitsgeber

bundestag <=> schützenverein

ironisch <=> erotisch
ironien <=> erotiken
ironie <=> erotik
ironiker <=> erotiker

kritisch <=> kryptisch
kritik <=> kryptik

ministerium <=> mysterium
ministerien <=> mysterien

problem <=> ekzem

# provozier <=> produzier


# bj(ö|oe)rn h(ö|oe)cke => bernd höcke
`, en: `
aggressive <=> attraktiv
    
amusing <=> relevant
amusement <=> relevance
    
ministry <=> mystery
ministries <=> mysteries
    
problem <=> eczema

ironic <=> erotic
irony <=> erotica
erotica <=> erotics
    
critic <=> cryptic
criticism <=> cryptic
    
provocat <=> produce
    
employee <=> employer
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
                        handleLine(obj, configStr.substring(startOfStatement, i - 1));
                        startOfStatement = -1;
                        break;
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

split_regex = /\s*(<=>|<=|=>)\s*/g
function handleLine(obj, line) {
    if (line.length === 0) return;

    let match = line.match(split_regex)
    if (!match || match.length === 0) {
        throw `"${line}" doesn't contain "<=>", "<=" or "=>"`
    } else if (match.length > 1) {
        throw `"${line} is invalid as it contains too many values.`;
    }

    const words = line.split(match[0]);
    switch(match[0].trim()) {
        case ":":
        case "<=>": {
            // create RegExp to ensure that it is valid regex.
            new RegExp(words[0])
            new RegExp(words[1])
            obj[words[0]] = words[1];
            obj[words[1]] = words[0];
            break;
        }
        case "<=": {
            new RegExp(words[1])
            obj[words[1]] = words[0];
            break;
        }
        case "=>": {
            new RegExp(words[0])
            obj[words[0]] = words[1];
        }
    }
}

function objToStr(obj) {
    const strBuilder = [];

    const already = [];
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (!already.includes(key)) {
            if (keys.includes(obj[key]) && key === obj[obj[key]]) {
                already.push(key, obj[key]);
                strBuilder.push(`${key} <=> ${obj[key]}`);
            } else {
                already.push(key);
                strBuilder.push(`${key} => ${obj[key]}`);
            }
        }
    }
    strBuilder.sort()

    return strBuilder.join("\n");
}
