
// Getting elements from the document
const intro = document.querySelector(".intro");
const usernameForms = document.getElementsByClassName("username-form");

const changeNameDialog = document.querySelector(".change-name");
const closeChangeNameBtn = changeNameDialog.querySelector(".close-change-name");


const usernameSpan = document.querySelector(".username span.name");
const changeNameBtn = document.querySelector(".username .change-name-btn");

const speedRateSpan = document.querySelector(".speed-rate .number");

const extractParagraph = document.querySelector(".extract-content");
const wordsTyped = extractParagraph.querySelector(".typed");
const currentWordTyped = extractParagraph.querySelector(".current-typed");
const currentWordWaiting = extractParagraph.querySelector(".current-waiting");
const wordsWaiting = extractParagraph.querySelector(".waiting");

const wordsInputContainer = document.querySelector(".input-container");
const wordsInput = document.getElementById("typing-input");

const bookSpan = document.querySelector(".footer span.book");
const authorSpan = document.querySelector(".footer span.author");

const startOverBtn = document.querySelector(".footer .start-over-btn");


// Global variables
let extracts = []; // An array that has all the extracts from the books
let usedExtracts = []; // An array that has the extracts we used before

let currentExtract; // The extract the user is currently typing
let currentExtractIndex = 0; // An index to the letter the user is currently typing (within the whole extract)

// An array that has the words of the extract followed by a SPACE
let separateWords = [];

let currentWordContent; // The word the user is currently typing
let currentWordIndex = 0; // An index to the letter the user is currently typing (within the word)
let currentWordLength; // The length of the word

let timerHandler = null; // A handler to the timer

let wordsWritten = 0; // How many words the user has correctly typed
let seconds = 0; // How many seconde have left since the user started

let clickSound = new Audio("./media/click.wav"); // The click sound


// Handling the page's first loading
document.addEventListener("DOMContentLoaded", () => {

  // What happens when the user typed their name and submit
  handleForms();

  // Adding event listeners to some elements
  addEvents();

});


// Function => Handling the forms
function handleForms() {

  Array.from(usernameForms).forEach(form => {

    // Get the input of the username
    let usernameInput = form.querySelector(".user-name");

    form.addEventListener("submit", (event) => {

      event.preventDefault();
      let inputValue = usernameInput.value; // Get the value

      // If it's equal to "", convert it to "unkown"
      inputValue == "" ? inputValue = "unknown" : null;

      // Show the user's name in the page
      usernameSpan.textContent = inputValue;

      // If it's the the form that shows up after the first loading,
      if (form.dataset.type == "start") {

        intro.classList.add("fuck-off"); // Close the form

        fetchData().then(data => { // Fetch the extracts

          extracts = data;
          addExtract(); // Add one of the extract to start typing

        });

        // If it's not, just close the form as it's the "change-name" form
      } else changeNameDialog.classList.remove("show-up");

    });

  });

}


// Function => Adding event listeners to the elements
function addEvents() {

  // Opening and closing the "change-name" form
  changeNameBtn.addEventListener("click", () => changeNameDialog.classList.add("show-up"))
  closeChangeNameBtn.addEventListener("click", () => changeNameDialog.classList.remove("show-up"))

  // The start over button
  startOverBtn.addEventListener("click", () => {
    addExtract(); // Add a new extract
  });

  // Add an event listener to the input
  wordsInput.addEventListener("keyup", (e) => {

    // If the length of the key pressed is 1 (it's a letter) or the key is the Backspace:
    if (e.key.length == 1 || e.key == "Backspace") checkCorrectness(e.key);

  });

}

// Function => Fetch the extracts
function fetchData() {

  let request = fetch("./data/quotes.json") // Fetch the file

    .then(resolve => {

      return resolve.json(); // Return the content of it

    })

    .catch(_ => { // If an error occured:

      throw new Error("Couldn't fetch the data"); // Throw an error

    });

  return request; // Return the "request" promise
}

// Function => Add an extract
function addExtract() {

  // 1 => Reset: 1 - gloal variables, 2 - some elements' content
  // 2 => Add a new input for the user to type [Explained later]
  reset();

  let len = extracts.length;
  let found = false;

  while (!found) {

    // Get a random index within the range of the extracts array's length
    let index = Math.floor(Math.random() * len);

    // If this index is in the "usedExtracts" array:
    // We won't use it (continue) because the user has seen it before
    if (usedExtracts.includes(index)) continue;

    // If not:
    usedExtracts.unshift(index); // Add the index to the "usedExtracts" array

    // Display the extract content, book name, and the author name in page
    let extract = extracts[index];
    bookSpan.textContent = extract.book;
    authorSpan.textContent = extract.author;

    // Update the "currentExtract" global variable
    currentExtract = extract.content;

    // Set found to "true", to stop the loop
    found = true;

  }

  // Separate the words of the "currentExtract" string and insert....
  // them into the "separateWords" array
  generateSeparateWords();

  // Make some changes to start typing the new word
  StartCurrentWord(0);

  // Wait 2 seconds and then let the user type
  setTimeout(() => {

    setTimer(); // Start the timer

    // Remove the "disabled" attriubte from the "wordsInput" input
    wordsInput.removeAttribute("disabled");
    wordsInput.focus(); // Add focus to the input

  }, 2000);

}

// Function => check the user's typing
function checkCorrectness(keyType) {

  // If the the last word was typed:
  if (currentWordContent == undefined) return

  // If the key pressed is a "Backspace":
  if (keyType == "Backspace") {

    // If the user has at least typed one letter in the curent word:
    if (currentWordIndex != 0) {

      // Decrease the "currentWordIndex" variable
      --currentWordIndex;

    } else return;

    // If it's not the "Backspace" key:
    // Increase the "currentWordIndex" variable
  } else currentWordIndex++;


  // Make a clone of the "clickSound" and play it;
  clickSound.cloneNode(true).play();

  // Get the correct portion of the current word
  let original = currentWordContent.slice(0, currentWordIndex);

  // Get the user's input
  let userInput = wordsInput.value;

  // Update the content of the spans
  currentWordTyped.textContent = original;
  currentWordWaiting.textContent = currentWordContent.slice(currentWordIndex);

  // Make the caret show-up
  currentWordTyped.style.setProperty("--display", "inline-block");

  // Compare the correct portion to the user's input
  if (original == userInput) { // If they are equal:

    // Make the color of the current word greenish
    currentWordTyped.classList.remove("wrong");

    // If it's the last letter in the word
    if (currentWordIndex == currentWordLength) {

      wordsWritten++; // Increase the "wordsWritten" variable
      wordsTyped.textContent += original; // Add the word to the typed words
      wordsInput.value = ""; // Empty the input

      currentWordTyped.textContent = ""; // Empty the typed part of the current word

      // Make some changes to start typing a new word
      StartCurrentWord(wordsWritten)

    }

    // If they're not equal
  } else currentWordTyped.classList.add("wrong");

}

// Function => Make changes for the next word
function StartCurrentWord(index) {

  // Get the next word in the "separateWords" array
  currentWordContent = separateWords[index];

  if (currentWordContent) {

    // Reset the "currentWordIndex" variable
    currentWordIndex = 0;

    // Update the "currentWordLength" variable
    currentWordLength = currentWordContent ? currentWordContent.length : null;

    // Update the "currentExtractIndex" variable
    currentExtractIndex += currentWordLength;

    // Update the content of the spans
    currentWordWaiting.textContent = currentWordContent.slice(0);
    wordsWaiting.textContent = currentExtract.slice(currentExtractIndex);

  }

  // Hide the caret
  currentWordTyped.style.setProperty("--display", "none");

}


// Function => Generating the separateWords array
function generateSeparateWords() {


  for (let i = 0; i < currentExtract.length;) {

    let temp = ""; // A temporary container for the word

    // Loop though the string till reaching a SPACE
    while (currentExtract[i]) {

      temp += currentExtract[i];
      i++;

      // If the current character, break
      if (currentExtract[i - 1] == " ") break;

    }

    separateWords.push(temp); // Add the word to the array

  }

}


// Function => Start the timer
function setTimer() {

  // Clear the previous interval
  clearInterval(timerHandler);

  timerHandler = setInterval(() => {

    // If the last word was typed
    if (currentWordContent == undefined) {

      // Disable the "wordsInput" input
      wordsInput.setAttribute("disabled", "");

      // Clear the interval
      clearInterval(timerHandler);

    };

    seconds += .5; // Increase the "seconds" variable

    // Calculate and display the typing speed
    speedRateSpan.textContent = Math.round(wordsWritten / (seconds / 60));

  }, 500);

}

// Function => Reset app data
function reset() {

  // Reset global variables
  currentWordContent = null;
  wordsWritten = 0;
  seconds = 0;
  currentExtractIndex = 0;
  currentWordLength = 0;
  currentWordIndex = 0;
  separateWords = [];


  // Reset the content of some elements
  wordsTyped.textContent = "";
  currentWordTyped.textContent = "";
  currentWordWaiting.textContent = "";
  speedRateSpan.textContent = "00";

}