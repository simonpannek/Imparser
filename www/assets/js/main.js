let map;

function parsePackage() {
    map = new Map();

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
            map.set(name, imposter);
            console.log(name + ": " + imposter)
        }
    }

    printTable();
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

function printTable() {
    const table = [];

    if (map.size) {
        table.push(
            "<thead><tr><th scope='col'>#</th><th scope='col'>Username</th><th scope='col'>Role</th></tr></thead>",
            "<tbody>"
        );

        let i = 1;
        for (let entry of map) {
            table.push(
                "<tr>",
                "<th scope='row'>" + i++ + "</th>",
                "<td>" + entry[0] + "</td>",
                "<td>" + (entry[1] ? "Imposter" : "Crewmate") + "</td>",
                "</tr>"
            );
        }

        table.push("</tbody>");
    }

    document.getElementById("result").innerHTML = table.join("");
}
