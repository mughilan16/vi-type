let text =
    "Historically, the fundamental role of pharmacists as a healthcare practitioner was to check and distribute drugs to doctors for medication that had been prescribed to patients.";
const typedTextElement = document.getElementById("typed-text");
const currentTextElement = document.getElementById("current-text");
const untypedTextElement = document.getElementById("untyped-text");
const input = document.getElementById("input");
const keyboard = document.getElementById("keyboard");
const container = document.getElementById("container");
const loadingScreen = document.getElementById("loading-screen");
let previousChar = "";

const infoCompleted = document.getElementById("info-completed");
const infoSpeed = document.getElementById("info-speed");

let time = false;
function createKeyboard() {
    const firstRow = "qwertyuiop[]";
    const secondRow = "asdfghjkl;'";
    const thirdRow = "zxcvbnm,./";
    const firstRowElement = document.getElementById("first-row");
    const secondRowElement = document.getElementById("second-row");
    const thirdRowElement = document.getElementById("third-row");
    let timerInterval;
    // Add the keys to the keyboard
    for (let i = 0; i < firstRow.length; i++) {
        let key = document.createElement("div");
        key.classList.add("key");
        key.id = firstRow[i];
        key.textContent = firstRow[i];
        firstRowElement.appendChild(key);
    }
    for (let i = 0; i < secondRow.length; i++) {
        let key = document.createElement("div");
        key.classList.add("key");
        key.id = secondRow[i];
        key.textContent = secondRow[i];
        secondRowElement.appendChild(key);
    }
    for (let i = 0; i < thirdRow.length; i++) {
        let key = document.createElement("div");
        key.classList.add("key");
        key.id = thirdRow[i];
        key.textContent = thirdRow[i];
        thirdRowElement.appendChild(key);
    }
    // Listen for keydown events
    window.addEventListener("keydown", function(event) {
        const letter = event.key;
        const keyElement = document.getElementById(letter);
        if (keyElement) {
            if (text[input.value.length] === letter)
                keyElement.classList.add("key-active");
            else keyElement.classList.add("key-error");
        }
    });

    // Listen for keyup events
    window.addEventListener("keyup", function(event) {
        const letter = event.key;
        const keyElement = document.getElementById(letter);
        if (keyElement) {
            keyElement.classList.remove("key-active");
            keyElement.classList.remove("key-error");
        }
    });
}
createKeyboard();
container.classList.add("hidden");
loadingScreen.classList.remove("hidden");

fetch("/api/randomSentence")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network Response Error");
        }
        return response.json();
    })
    .then((data) => {
        text = data.text;
        untypedTextElement.innerText = text;
        container.classList.remove("hidden");
        loadingScreen.classList.remove("loading-screen");
        loadingScreen.classList.add("hidden");
        infoCompleted.innerText = `0/${text.split(" ").length}`;
        input.focus();
    })
    .catch((error) => {
        console.log("Fetch error", error);
    });
input.addEventListener("focus", () => {
    document.getElementById("input-div").classList.add("input-div-active");
    document.getElementById("input-label").classList.add("input-label-active");
});
input.addEventListener("focusout", () => {
    document.getElementById("input-div").classList.remove("input-div-active");
    document.getElementById("input-label").classList.remove("input-label-active");
});
input.addEventListener("keydown", (e) => {
    if (e.which === 9) {
        e.preventDefault();
        location.reload();
    }
    if (previousChar === " " && e.key === " ") {
        e.preventDefault();
        return;
    }
    previousChar = e.key;
});
input.addEventListener("paste", (e) => {
    e.preventDefault();
});

function timer() {
    let min = (new Date().getTime() - time) / 60_000;
    let speed = input.value.split(" ").length / min;
    console.log(speed);
    infoSpeed.innerText = `${parseInt(speed)}`;
}

function changeHandler() {
    if (!time) {
        time = new Date().getTime();
        timerInterval = setInterval(timer, 200);
    }
    const textList = text.split(" ");
    const inputList = input.value.split(" ");
    infoCompleted.innerText = `${inputList.length - 1}/${textList.length}`;
    const inputLength = inputList.length;
    if (inputLength > textList.length) {
        input.value = "";
        location.href = "/result";
        return;
    }
    const typedList = textList.map((item, i) => {
        if (i >= inputLength) {
            return item;
        }
        if (item !== input.value.split(" ")[i]) {
            return `<span class='typed-error'>${item}</span>`;
        }
        return item;
    });
    const currentWord = inputList[inputLength - 1];
    currentTextElement.classList.remove("current-error");
    for (let i = 0; i < currentWord.length; i++) {
        if (currentWord[i] !== textList[inputLength - 1][i]) {
            currentTextElement.classList.add("current-error");
            break;
        }
    }

    typedTextElement.innerHTML = typedList.slice(0, inputLength - 1).join(" ");
    currentTextElement.innerText = textList[inputLength - 1];
    untypedTextElement.innerText = textList
        .slice(inputLength, textList.length)
        .join(" ");
}
