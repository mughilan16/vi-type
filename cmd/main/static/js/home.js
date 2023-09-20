// HTML Elements
const typedTextElement = document.getElementById("typed-text");
const currentTextElement = document.getElementById("current-text");
const untypedTextElement = document.getElementById("untyped-text");
const resultContainer = document.getElementById("result");
const chartElement = document.getElementById("result-chart");

const firstRowElement = document.getElementById("first-row");
const secondRowElement = document.getElementById("second-row");
const thirdRowElement = document.getElementById("third-row");

const keyboard = document.getElementById("keyboard");
const container = document.getElementById("container");
const loadingScreen = document.getElementById("loading-screen");

const infoCompleted = document.getElementById("info-completed");
const infoSpeed = document.getElementById("info-speed");

class App {
    constructor() {
        this.timerInterval;
        this.time = false;
        this.currentWord = "";
        this.input = [];
        this.text = "";
        this.textList = [];
        this.previousChar = "";
        this.speedList = [];
        this.rawSpeedList = [];
        this.timeList = [];
        this.errorCount = 0;
    }

    start() {
        this.fetchText();
        this.startInputListener();
        this.createKeyboard();
    }

    startInputListener() {
        window.addEventListener("keydown", (e) => {
            const letter = e.key;
            if (e.key == "Tab") {
                e.preventDefault();
                location.reload();
            } else if (letter.length === 1 && letter !== " ") {
                this.currentWord += letter;
            } else if (letter === " ") {
                this.input.push(this.currentWord);
                this.currentWord = "";
            }

            if (letter === "Backspace") {
                if (this.currentWord.length > 0) {
                    this.currentWord = this.currentWord.slice(
                        0,
                        this.currentWord.length - 1,
                    );
                } else if (this.input.length > 0) this.currentWord = this.input.pop();
            }
            console.log(this.currentWord);
            console.log(this.input.join(" "));
        });
    }

    fetchText() {
        fetch("/api/randomSentence")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network Response Error");
                }
                return response.json();
            })
            .then((data) => {
                this.text = data.text;
                this.textList = this.text.split(" ");
                untypedTextElement.innerText = this.text;
                console.log("Workign");
                container.classList.remove("hidden");
                loadingScreen.classList.remove("loading-screen");
                loadingScreen.classList.add("hidden");
                infoCompleted.innerText = `0/${this.text.split(" ").length}`;
            })
            .catch((error) => {
                console.log("Fetch error", error);
            });
    }

    createKeyboard() {
        const firstRow = "qwert yuiop[]";
        const secondRow = "asdfg hjkl;'";
        const thirdRow = "zxcvb nm,./";
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
                //if (this.text[input.value.length] === letter)
                    keyElement.classList.add("key-active");
                keyElement.style.animation = "key-active 0.3s linear"
                //else keyElement.classList.add("key-error");
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
                keyElement.style.animation = "key-inactive 0.3s linear"
                keyElement.classList.remove("key-active");
                keyElement.classList.remove("key-error");
            }
        });
    }

    changeHandler() {
        if (!this.time) {
            this.time = new Date().getTime();
            this.timerInterval = setInterval(timer, 400);
        }
        const inputList = this.input.split(" ");
        infoCompleted.innerText = `${inputList.length - 1}/${this.textList.length}`;
        const inputLength = inputList.length;
        if (inputLength > this.textList.length) {
            input = "";
            clearInterval(timerInterval);
            container.classList.add("hidden");
            loadingScreen.classList.remove("hidden");
            loadingScreen.classList.add("loading-screen");
            const data = {
                speedList: this.speedList,
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
        const typedList = this.textList.map((item, i) => {
            if (i >= inputLength) {
                return item;
            }
            if (item !== this.input.split(" ")[i]) {
                return `<span class='typed-error'>${item}</span>`;
            }
            return item;
        });
        const currentWord = inputList[inputLength - 1];
        currentTextElement.classList.remove("current-error");
        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] !== this.textList[inputLength - 1][i]) {
                currentTextElement.classList.add("current-error");
                errorCount++;
                break;
            }
        }

        typedTextElement.innerHTML = typedList.slice(0, inputLength - 1).join(" ");
        currentTextElement.innerText = this.textList[inputLength - 1];
        untypedTextElement.innerText = this.textList
            .slice(inputLength, this.textList.length)
            .join(" ");
    }

    timer() {
        let min = (new Date().getTime() - time) / 60_000;
        const inputList = this.input.split(" ");
        let correctWords = [];
        for (let i = 0; i < inputList.length; i++) {
            if (inputList[i] === this.textList[i]) {
                correctWords.push(inputList[i]);
            }
        }
        length = correctWords.join(" ").length / 5;
        let rawLength = this.input.length / 5;
        let speed = length / min;
        let rawSpeed = rawLength / min;
        this.timeList.push(min);
        this.speedList.push(parseInt(speed));
        this.rawSpeedList.push(rawSpeed);
        infoSpeed.innerText = `${parseInt(speed)}`;
    }

    displayResult() {
        this.speedList.shift();
        this.speedList.shift();
        this.speedList.shift();
        const step = Math.floor(this.speedList.length / 15);
        const reducedSpeedList = [];
        for (let i = 0; i < this.speedList.length; i += step) {
            const slice = this.speedList.slice(i, i + step);
            const mean = Math.floor(
                slice.reduce((acc, val) => acc + val, 0) / slice.length,
            );
            reducedSpeedList.push(mean);
        }
        const chart = new Chart(chartElement, {
            type: "line",
            data: {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                datasets: [
                    {
                        label: "wpm",
                        data: reducedSpeedList,
                    },
                    {
                        label: "raw",
                        data: this.rawSpeedList,
                    },
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
}

const app = new App();
app.start();
