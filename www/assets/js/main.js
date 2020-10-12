let map;

function parsePackage() {
    map = new Map();

    const dump = splitIntoBytes(document.getElementById("dump").value);

    let pointer = 0;

    try {
        // Check for package length
        if (dump.length <= 42) throw new Error("Couldn't skip UDP Header, package is too short.");
        pointer += 42;

        // Check for reliable package
        if (getByte(pointer, dump) !== 1) throw new Error("The package you have entered has the wrong type.");
        pointer += 5;

        // Check for GameData
        if (getByte(pointer, dump) !== 5) throw new Error("The package you have entered contains the wrong content.");
        pointer += 5;

        // Loop through GameData
        while (pointer < dump.length) {
            // Get size and type
            let size = getByte(pointer, dump) + getByte(pointer + 1, dump) * 256;
            pointer += 2;
            const type = getByte(pointer++, dump);

            // Check if type is interesting to us
            if (type === 2) {
                // Get target and action
                const target = getByte(pointer++, dump);
                if (target > 127) {
                    pointer++;
                    size--;
                }
                const action = getByte(pointer++, dump);

                // Update size
                size -= 2;

                // Check if action is interesting to us
                if (action === 30) {
                    // Loop through players
                    while (pointer < dump.length) {
                        // Get size and id
                        const player_size = getByte(pointer, dump) + getByte(pointer + 1, dump) * 256;
                        pointer += 2;
                        const player_id = getByte(pointer++, dump);

                        // Get name
                        const name_length = getByte(pointer++, dump);
                        let name = "";
                        for (let i = 0; i < name_length; i++)
                            name += String.fromCharCode(getByte(pointer + i, dump));
                        pointer += name_length;

                        // Get color, hat, pet and skin
                        const color = getByte(pointer++, dump);
                        const hat = getByte(pointer++, dump);
                        const pet = getByte(pointer++, dump);
                        const skin = getByte(pointer++, dump);

                        // Get status
                        const status = getByte(pointer++, dump);

                        // Skip tasks
                        const task_count = getByte(pointer++, dump);
                        pointer += task_count * 2;

                        // Put info in the map
                        map.set(name, {
                            id: player_id,
                            color: color,
                            hat: hat,
                            pet: pet,
                            skin: skin,
                            status: status
                        });

                        // Update size
                        size -= player_size;
                    }
                }
            }

            // Skip to end of part
            pointer += size;
        }

        printTable();

    } catch (e) {
        printError(e);
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

function getByte(pointer, array) {
    return parseInt("0x" + array[pointer]);
}

function printError(e) {
    document.getElementById("result").innerHTML = "<span style='color: red'>" + e + "</span>";
}

function printTable() {
    const table = [];

    if (map.size) {
        table.push(
            "<thead><tr><th scope='col'>#</th><th scope='col'>Username</th><th scope='col'>Color</th>" +
            "<th scope='col'>Hat</th><th scope='col'>Pet</th><th scope='col'>Skin</th>" +
            "<th scope='col'>Role</th></tr></thead><tbody>"
        );

        for (let entry of map) {
            const name = entry[0];
            const data = entry[1];
            table.push(
                "<tr>",
                "<th scope='row'>" + data.id + "</th>",
                "<td>" + name + "</td>",
                "<td>" + printImage("color", data.color) + "</td>",
                "<td>" + printImage("hat", data.hat, true) + "</td>",
                "<td>" + printImage("pet", data.pet, true) + "</td>",
                "<td>" + printImage("skin", data.skin, true) + "</td>",
                "<td>" + (data.status === 0 ? "Crewmate" : "Imposter") + "</td>",
                "</tr>"
            );
        }

        table.push("</tbody>");
    }

    document.getElementById("result").innerHTML = table.join("");
}

function printImage(type, id, small) {
    return "<img " + (small ? "class='smaller' " : "") + "src='assets/img/" + type + "/" + id + ".png' alt='Could not find id " + id + "'>";
}
