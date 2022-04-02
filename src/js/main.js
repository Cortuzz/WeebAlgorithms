function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

function componentToHex(c) {
    c = c < 0 ? 0 : c;
    c = c > 255 ? 255 : c;

    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function print(value) {
    console.log(JSON.parse(JSON.stringify(value)))
}

async function fetch_data() {
    return fetch('../addons/weights.json')
        .then(response => response.json())
        .then(json => {
            return json;
        })
}
