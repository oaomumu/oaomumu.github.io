// index.js

// Game variables
let level = 1;
let targetNumber;
let givenNumbers;
let usedNumbers = [];
let calculation = "";
let inputTokens = []; // Array to track input tokens

const operations = ['+', '-', '*', '/'];

// Elements
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const levelNumberDisplay = document.getElementById('level-number');
const finalLevelDisplay = document.getElementById('final-level');
const calculationDisplay = document.getElementById('calculation-display');
const feedbackDisplay = document.getElementById('feedback');
const submitButton = document.getElementById('submit-button');
const numberPad = document.getElementById('number-pad');

// Buttons
const startGameButton = document.getElementById('start-game-button');
const nextLevelButton = document.getElementById('next-level-button');

// Initialize the game
function initGame() {
    // Show the title screen
    showScreen('title-screen');

    // Start game button listener
    startGameButton.addEventListener('click', () => {
        level = 1;
        startLevel();
    });

    // Next level button listener
    nextLevelButton.addEventListener('click', () => {
        level++;
        startLevel();
    });
}

// Start a level
function startLevel() {
    // Reset variables
    usedNumbers = [];
    calculation = "";
    inputTokens = []; // Reset input tokens
    feedbackDisplay.textContent = "";
    calculationDisplay.textContent = "Tap numbers and operators below";

    // Update level display
    levelNumberDisplay.textContent = level;

    // Generate target number and given numbers
    generateLevel();

    // Set up the number pad
    setupNumberPad();

    // Show the game screen
    showScreen('game-screen');
}

// Generate level data
function generateLevel() {
    let isValidPuzzle = false;

    while (!isValidPuzzle) {
        // Determine difficulty settings based on level
        let numberCount;
        let maxNumber;
        let maxTarget;

        if (level <= 10) {
            numberCount = 3; // Fewer numbers for simplicity
            maxNumber = 10;
            maxTarget = 10;
        } else if (level <= 20) {
            numberCount = 4;
            maxNumber = 20;
            maxTarget = 50;
        } else if (level <= 30) {
            numberCount = 5;
            maxNumber = 50;
            maxTarget = 100;
        } else {
            numberCount = 6;
            maxNumber = 100 + level * 2;
            maxTarget = null; // No upper limit
        }

        // Generate random numbers for the given numbers
        givenNumbers = [];
        for (let i = 0; i < numberCount; i++) {
            givenNumbers.push(getRandomInt(1, maxNumber));
        }

        // Generate a random valid expression using the given numbers
        const expressionResult = generateValidExpression(givenNumbers.slice(), maxTarget, level <= 30);

        if (expressionResult) {
            targetNumber = expressionResult.result;
            isValidPuzzle = true;

            // Update the target number display
            document.getElementById('target-number').textContent = targetNumber;
        }
    }
}

// Generate a valid expression using the given numbers
function generateValidExpression(numbers, maxTarget, positiveOnly) {
    // Shuffle the numbers to get random order
    shuffleArray(numbers);

    // Try multiple times to generate a valid expression
    for (let attempt = 0; attempt < 100; attempt++) {
        let expression = "";
        let usedNums = [];

        // Build an expression by inserting random operations between numbers
        for (let i = 0; i < numbers.length; i++) {
            const num = numbers[i];
            usedNums.push(num);
            expression += num.toString();

            if (i < numbers.length - 1) {
                const op = operations[getRandomInt(0, operations.length)];
                expression += op;
            }
        }

        // Try to evaluate the expression
        try {
            // eslint-disable-next-line no-eval
            const result = eval(expression);

            // Check if the result is a valid number
            if (!isNaN(result) && isFinite(result) && Number.isInteger(result)) {
                // Check target number constraints
                if ((maxTarget === null || Math.abs(result) <= maxTarget) && (!positiveOnly || result > 0)) {
                    return { expression, result };
                }
            }
        } catch (e) {
            // Ignore invalid expressions
        }
    }

    return null; // Failed to generate a valid expression within constraints
}

// Set up the number pad
function setupNumberPad() {
    // Clear existing buttons
    numberPad.innerHTML = '';

    // Create number buttons with unique identifiers
    givenNumbers.forEach((number, index) => {
        const button = document.createElement('div');
        button.className = 'number-button';
        button.textContent = number;
        button.dataset.numberIndex = index; // Assign a unique index
        numberPad.appendChild(button);
    });

    // Create operator buttons
    const operators = ['+', '−', '×', '÷'];
    operators.forEach(operator => {
        const button = document.createElement('div');
        button.className = 'operator-button';
        button.textContent = operator;
        numberPad.appendChild(button);
    });

    // Create utility buttons
    const utilities = ['(', ')', '←', 'CLR'];
    utilities.forEach(action => {
        const button = document.createElement('div');
        button.className = 'utility-button';
        button.textContent = action;
        numberPad.appendChild(button);
    });

    // Add event listeners
    addNumberPadListeners();
}

// Add event listeners to number pad buttons
function addNumberPadListeners() {
    const numberButtons = document.querySelectorAll('.number-button');
    const operatorButtons = document.querySelectorAll('.operator-button');
    const utilityButtons = document.querySelectorAll('.utility-button');

    // Number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.textContent;
            const index = button.dataset.numberIndex;

            if (!usedNumbers.includes(index)) {
                inputTokens.push({ type: 'number', value: number, index: index });
                calculation = inputTokens.map(token => token.value).join('');
                usedNumbers.push(index);
                button.classList.add('used');
                updateCalculationDisplay();
            } else {
                showFeedback(`You've already used the number ${number}.`, 'error');
            }
        });
    });

    // Operator buttons
    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const operator = button.textContent;
            inputTokens.push({ type: 'operator', value: convertOperator(operator) });
            calculation = inputTokens.map(token => token.value).join('');
            updateCalculationDisplay();
        });
    });

    // Utility buttons
    utilityButtons.forEach(button => {
        const action = button.textContent;
        button.addEventListener('click', () => {
            if (action === '←') {
                backspace();
            } else if (action === 'CLR') {
                clearCalculation();
            } else if (action === '(' || action === ')') {
                inputTokens.push({ type: 'parenthesis', value: action });
                calculation = inputTokens.map(token => token.value).join('');
                updateCalculationDisplay();
            }
        });
    });

    // Submit button
    submitButton.addEventListener('click', submitAnswer);
}

// Update the calculation display
function updateCalculationDisplay() {
    calculationDisplay.textContent = calculation;
}

// Convert display operator to JavaScript operator
function convertOperator(operator) {
    switch (operator) {
        case '×':
            return '*';
        case '÷':
            return '/';
        case '−':
            return '-';
        case '+':
            return '+';
        default:
            return '';
    }
}

// Handle backspace action
function backspace() {
    if (inputTokens.length > 0) {
        const lastToken = inputTokens.pop();

        if (lastToken.type === 'number') {
            // Remove from usedNumbers
            const index = lastToken.index;
            usedNumbers = usedNumbers.filter(i => i !== index);

            // Update button state
            const numberButtons = document.querySelectorAll('.number-button');
            numberButtons.forEach(button => {
                if (button.dataset.numberIndex == index) {
                    button.classList.remove('used');
                }
            });
        }

        // Rebuild the calculation string
        calculation = inputTokens.map(token => token.value).join('');
        updateCalculationDisplay();
    }
}

// Handle clear action
function clearCalculation() {
    calculation = "";
    usedNumbers = [];
    inputTokens = []; // Reset input tokens
    updateCalculationDisplay();
    feedbackDisplay.textContent = "";

    // Reset number buttons
    const numberButtons = document.querySelectorAll('.number-button');
    numberButtons.forEach(button => {
        button.classList.remove('used');
    });
}

// Submit the player's answer
function submitAnswer() {
    if (calculation === "") {
        showFeedback("Please enter a calculation.", 'error');
        return;
    }

    try {
        // Evaluate the calculation safely
        const result = evaluateCalculation(calculation);

        if (result === targetNumber && areAllNumbersUsed()) {
            showFeedback("🎉 Correct! You reached the target number!", 'success');
            playSuccessAnimation(); // Play success animation
            // Show end screen after a short delay
            setTimeout(() => {
                finalLevelDisplay.textContent = level;
                showScreen('end-screen');
            }, 2000); // Increased delay to allow animation to play
        } else if (result === targetNumber) {
            showFeedback("Almost there! Make sure to use all the given numbers.", 'warning');
        } else {
            showFeedback(`Your result is ${result}. Try again!`, 'error');
        }
    } catch (error) {
        showFeedback("Invalid calculation. Please check your input.", 'error');
    }
}

// Check if all given numbers have been used
function areAllNumbersUsed() {
    return usedNumbers.length === givenNumbers.length;
}

// Evaluate the calculation string safely
function evaluateCalculation(calc) {
    // Allowed characters: numbers, operators, parentheses
    const validChars = /^[0-9+\-*/() ]+$/;
    if (!validChars.test(calc)) {
        throw new Error("Invalid characters in calculation.");
    }

    // eslint-disable-next-line no-eval
    const result = eval(calc);
    // Return result as integer if it's a whole number
    return Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
}

// Show feedback messages
function showFeedback(message, type) {
    feedbackDisplay.textContent = message;

    if (type === 'success') {
        feedbackDisplay.style.color = '#388e3c';
    } else if (type === 'warning') {
        feedbackDisplay.style.color = '#fbc02d';
    } else {
        feedbackDisplay.style.color = '#d32f2f';
    }
}

// Play success animation
function playSuccessAnimation() {
    // Create confetti elements
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = getRandomColor();
        confettiContainer.appendChild(confetti);
    }

    document.body.appendChild(confettiContainer);

    // Remove confetti after animation
    setTimeout(() => {
        confettiContainer.remove();
    }, 2000);
}

// Get a random color for confetti
function getRandomColor() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#4caf50', '#ffeb3b', '#ff9800', '#795548'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Show the specified screen
function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show the selected screen
    const screenToShow = document.getElementById(screenId);
    screenToShow.classList.add('active');
}

// Utility functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Shuffle array in place
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start the game
initGame();