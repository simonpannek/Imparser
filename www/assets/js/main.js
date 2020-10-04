function parsePackage() {
    const dump = splitIntoBytes(document.getElementById("dump").value);

    for (let i = 160; i < dump.length; i++) {
        let current = parseInt("0x" + dump[i]);

        let name = "";

        // Parse names
        while (current === 32 ||
            (current >= 48 && current <= 71) ||
            (current >= 65 && current <= 90) ||
            (current >= 97 && current <= 122)) {
            name += String.fromCharCode(current);

            i++;
            current = parseInt("0x" + dump[i]);
        }
        name = name.trim();

        if (name.length > 0) {
            // Check for Imposter
            i += 4;
            const imposter = dump[i] !== "00";

            console.log(name + ": " + (imposter ? "Imposter" : "Crewmate"));
        }
    }
}

function splitIntoBytes(str) {
    if (typeof str !== "string") return [];

    const bytes = [];
    const size = 2;

    do {
        bytes.push(str.substring(0, size));
    } while ((str = str.substring(size)) !== "");

    return bytes;
}
