let text =
    "Historically, the fundamental role of pharmacists as a healthcare practitioner was to check and distribute drugs to doctors for medication that had been prescribed to patients.";
const typedTextElement = document.getElementById("typed-text");
const currentTextElement = document.getElementById("current-text");
const untypedTextElement = document.getElementById("untyped-text");
const resultContainer = document.getElementById("result");
const chartElement = document.getElementById("result-chart");

const input = document.getElementById("input");
const keyboard = document.getElementById("keyboard");
const container = document.getElementById("container");
const loadingScreen = document.getElementById("loading-screen");
let previousChar = "";

const infoCompleted = document.getElementById("info-completed");
const infoSpeed = document.getElementById("info-speed");

const speedList = [];
const rawSpeedList = [];
const timeList = [];
let errorCount = 0;

container.addEventListener("keydown", (e) => {
    if (e.which == 9) {
        location.reload();
    }
});

let timerInterval;

let time = false;
function createKeyboard() {
    const firstRow = "qwert yuiop[]";
    const secondRow = "asdfg hjkl;'";
    const thirdRow = "zxcvb nm,./";
    const firstRowElement = document.getElementById("first-row");
    const secondRowElement = document.getElementById("second-row");
    const thirdRowElement = document.getElementById("third-row");
    // Add the keys to the keyboard
    for (let i = 0; i < firstRow.length; i++) {
        let key = document.createElement("div");
        if (firstRow[i] == " ") {
            let seperator = document.createElement("div");
            seperator.classList.add("seperator");
            seperator.textContent = " ";
            firstRowElement.appendChild(seperator);
            continue;
        }
        key.classList.add("key");
        key.id = firstRow[i];
        key.textContent = firstRow[i];
        firstRowElement.appendChild(key);
    }
    for (let i = 0; i < secondRow.length; i++) {
        if (secondRow[i] == " ") {
            let seperator = document.createElement("div");
            seperator.classList.add("seperator");
            seperator.textContent = " ";
            secondRowElement.appendChild(seperator);
            continue;
        }
        let key = document.createElement("div");
        key.classList.add("key");
        key.id = secondRow[i];
        key.textContent = secondRow[i];
        secondRowElement.appendChild(key);
    }
    for (let i = 0; i < thirdRow.length; i++) {
        if (thirdRow[i] == " ") {
            let seperator = document.createElement("div");
            seperator.classList.add("seperator");
            seperator.textContent = " ";
            thirdRowElement.appendChild(seperator);
            continue;
        }
        let key = document.createElement("div");
        key.classList.add("key");
        key.id = thirdRow[i];
        key.textContent = thirdRow[i];
        thirdRowElement.appendChild(key);
    }
    // Listen for keydown events
    window.addEventListener("keydown", function(event) {
        const letter = event.key;
        let keyElement = document.getElementById(letter);
        if (event.key === " ") {
            keyElement = document.getElementById("space-key");
        }
        if (keyElement) {
            if (text[input.value.length] === letter)
                keyElement.classList.add("key-active");
            else keyElement.classList.add("key-error");
        }
    });

    // Listen for keyup events
    window.addEventListener("keyup", function(event) {
        const letter = event.key;
        let keyElement = document.getElementById(letter);
        if (event.key === " ") {
            keyElement = document.getElementById("space-key");
        }
        if (keyElement) {
            keyElement.classList.remove("key-active");
            keyElement.classList.remove("key-error");
        }
    });
}
createKeyboard();
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
    const inputList = input.value.split(" ");
    const textList = text.split(" ");
    let correctWords = [];
    for (let i = 0; i < inputList.length; i++) {
        if (inputList[i] === textList[i]) {
            correctWords.push(inputList[i]);
        }
    }
    length = correctWords.join(" ").length / 5;
    let rawLength = input.length / 5;
    let speed = length / min;
    let rawSpeed = rawLength / min;
    timeList.push(min);
    speedList.push(parseInt(speed));
    rawSpeedList.push(rawSpeed);
    infoSpeed.innerText = `${parseInt(speed)}`;
}

function changeHandler() {
    if (!time) {
        time = new Date().getTime();
        timerInterval = setInterval(timer, 400);
    }
    const textList = text.split(" ");
    const inputList = input.value.split(" ");
    infoCompleted.innerText = `${inputList.length - 1}/${textList.length}`;
    const inputLength = inputList.length;
    if (inputLength > textList.length) {
        input.value = "";
        clearInterval(timerInterval);
        container.classList.add("hidden");
        loadingScreen.classList.remove("hidden");
        loadingScreen.classList.add("loading-screen");
        const data = {
            speedList: speedList,
            errorCount: errorCount,
            timeTakenInSeconds: parseInt((time - new Date().getDate()) / 1000),
        };
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        };
        fetch("/result", requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return null;
            })
            .then((_) => {
                loadingScreen.classList.add("hidden");
                loadingScreen.classList.remove("loading-screen");
                resultContainer.classList.remove("hidden");
                displayResult();
            });
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
            errorCount++;
            break;
        }
    }

    typedTextElement.innerHTML = typedList.slice(0, inputLength - 1).join(" ");
    currentTextElement.innerText = textList[inputLength - 1];
    untypedTextElement.innerText = textList
        .slice(inputLength, textList.length)
        .join(" ");
}

function displayResult() {
    const chart = new Chart(chartElement, {
        type: "line",
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            datasets: [
                {
                    label: "wpm",
                    data: speedList,
                },
                {
                    label: "raw",
                    data: rawSpeedList,
                }
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    name: "",
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
    console.log(chart);
}
