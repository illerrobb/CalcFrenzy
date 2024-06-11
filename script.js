let problemElement = document.getElementById('problem');
let nextProblemElement = document.getElementById('next-problem');
let answerPlaceholderElement = document.getElementById('answer-placeholder');
let resultElement = document.getElementById('result');
let timerElement = document.getElementById('timer');
let levelElement = document.getElementById('level');
let menuElement = document.getElementById('menu');
let gameElement = document.getElementById('game');
let endgameElement = document.getElementById('endgame');
let scoreElement = document.getElementById('score');

let timer;
let timerDuration = 100;
let timeLeft;
let currentProblem;
let currentAnswer;
let nextProblem;
let nextAnswer;
let isReplacing = 0;
const disturbanceFrequency = Math.min(level / 10, 0.5);
const disturbanceEffects = ['shake', 'flip', 'hideKeys', 'addSkullButton'];
const animalEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'];

function startGame() {
    menuElement.style.display = 'none';
    gameElement.style.display = 'flex';
    endgameElement.style.display = 'none';
    level = 1;
    score = 0;
    levelElement.textContent = level;
    generateCurrentAndNextProblem();
    displayProblems();
    resetTimer();
    applyRandomDisturbance();  // Start the autonomous disturbances
}

function restartGame() {
    menuElement.style.display = 'none';
    gameElement.style.display = 'flex';
    endgameElement.style.display = 'none';
    level = 1;
    score = 0;
    levelElement.textContent = level;
    generateCurrentAndNextProblem();
    displayProblems();
    resetTimer();
    clearAnswer();
}

function endGame() {
    clearInterval(timer);
    gameElement.style.display = 'none';
    endgameElement.style.display = 'flex';
    scoreElement.textContent = score;
}

function generateProblem() {
    const operators = ['+', '-', '*'];

    function getRandomNumber() {
        return Math.floor(Math.random() * 10 + (level * 0.15));
    }

    function getRandomOperator() {
        return operators[Math.floor(Math.random() * operators.length)];
    }

    function createSimpleExpression() {
        let num1 = getRandomNumber();
        let num2 = getRandomNumber();
        let operator = getRandomOperator();

        return `${num1} ${operator} ${num2}`;
    }

    function createComplexExpression() {
        const innerExpression = createSimpleExpression();
        const num = getRandomNumber();
        const operator = getRandomOperator();

        if (Math.random() < 0.5) {
            return `(${innerExpression}) ${operator} ${num}`;
        } else {
            return `${num} ${operator} (${innerExpression})`;
        }
    }

    function createDoubleComplexExpression() {
        const innerExpression1 = createSimpleExpression();
        const innerExpression2 = createSimpleExpression();
        const operator = getRandomOperator();

        return `(${innerExpression1}) ${operator} (${innerExpression2})`;
    }

    function evaluateExpression(expression) {
        try {
            const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');
            return new Function(`return ${sanitizedExpression}`)();
        } catch (error) {
            return NaN;
        }
    }

    let expression;
    let result;
    const maxResult = 10 + level * 0.5; // Incrementa la difficoltà con il livello

    do {
        const complexProbability = Math.min(level / 100, 0.5);
        const doubleComplexProbability = Math.min(level / 200, 0.1);
        const randomValue = Math.random();

        if (randomValue < doubleComplexProbability && level > 10) {
            expression = createDoubleComplexExpression();
        } else if (randomValue < complexProbability && level > 20) {
            expression = createComplexExpression();
        } else {
            expression = createSimpleExpression();
        }

        result = evaluateExpression(expression);
    } while (result < 0 || isNaN(result) || result > maxResult);

    return { expression, result };
}

function generateCurrentAndNextProblem() {
    let current = generateProblem();
    let next = generateProblem();
    currentProblem = current.expression;
    currentAnswer = current.result;
    nextProblem = next.expression;
    nextAnswer = next.result;
    
    console.log('nextAnswer:', nextAnswer); // Debugging: output expected answer
    console.log('currentAnswer:', currentAnswer); // Debugging: output expected answer
}

function displayProblems() {
    problemElement.innerHTML = `${currentProblem} = <span id="answer-placeholder">?</span>`;
    nextProblemElement.innerHTML = `${nextProblem} = ?`;
}

function handleCorrectAnswer() {
    // Remove the current problem element
    problemElement.remove();

    // Make the next-problem element the new problem element
    nextProblemElement.id = 'problem';
    nextProblemElement.className = 'problem';
    nextProblemElement.innerHTML = `${nextProblem} = <span id="answer-placeholder">?</span>`;
    //nextProblemElement.style.animation = 'drop 0.5s';
    //setTimeout(() => nextProblemElement.style.animation = '', 500);
    
    // Create a new next-problem element
    let newNextProblemElement = document.createElement('p');
    newNextProblemElement.id = 'next-problem';
    newNextProblemElement.className = 'problem';

    // Prepend the new next-problem element before the new problem element
    document.querySelector('.problem-container').prepend(newNextProblemElement);

    // Update the problem elements
    problemElement = document.getElementById('problem');
    nextProblemElement = document.getElementById('next-problem');
    
    // Animate the elements
    problemElement.style.animation = 'drop 0.5s';
    setTimeout(() => problemElement.style.animation = '', 500);       
    nextProblemElement.style.animation = 'drop 0.5s';
    setTimeout(() => nextProblemElement.style.animation = '', 500);
    
    currentProblem = nextProblem;
    currentAnswer = nextAnswer;
    
    // Generate a new next problem
    let next = generateProblem();
    nextProblem = next.expression;
    nextAnswer = next.result;
    console.log('nextAnswer:', nextAnswer); // Debugging: output expected answer
    console.log('currentAnswer:', currentAnswer); // Debugging: output expected answer

    // Display the new problems
    nextProblemElement.innerHTML = `${nextProblem} = ?`;
}

function submitAnswer() {
    let answerPlaceholderElement = document.getElementById('answer-placeholder');
    let userAnswer = parseFloat(answerPlaceholderElement.textContent);

    console.log('Expected:', currentAnswer); // Debugging: output expected answer
    console.log('User Answer:', userAnswer); // Debugging: output user's answer

    if (userAnswer === parseFloat(currentAnswer)) {
        resultElement.textContent = 'Correct!';
        clearInterval(timer);
        level++;
        score += 10;
        levelElement.textContent = level;
        handleCorrectAnswer();
        addTime(5);
    } else {
        problemElement.style.animation = 'shake 0.2s';
        setTimeout(() => {
            problemElement.style.animation = '';
            resultElement.textContent = 'Incorrect, try again.';
        }, 500);
    }
    clearAnswer();
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = timerDuration;
    resultElement.textContent = timeLeft;
    timerElement.style.width = '100%';
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerElement.style.width = ((timeLeft)/timerDuration) * 100 + '%';
    resultElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timer);
        resultElement.textContent = 'Time is up! You lost.';
        setTimeout(endGame, 15);
    }
}

function addTime(seconds) {
    timeLeft += seconds;
    // Ensure timeLeft doesn't exceed the initial max value (e.g., 10 seconds in this case)
    if (timeLeft > timerDuration) timeLeft = timerDuration;

    // If the timer is not already running, start it
    timer = setInterval(updateTimer, 1000);
    
    // Update the timer visuals
    timerElement.style.width = ((timeLeft) / timerDuration) * 100 + '%';
    resultElement.textContent = timeLeft;


}

function applyRandomDisturbance() {
    const disturbanceInterval = 5000 + Math.random() * 5000/level*0.05; // Random interval between 5 and 10 seconds

    function applyDisturbance() {
        // Ensure problemElement is correctly referenced
        problemElement = document.getElementById('problem');
        console.log('Applying disturbance to:', problemElement); // Debugging: output problem element

        const effect = disturbanceEffects[Math.floor(Math.random() * disturbanceEffects.length)];
        //problemElement.classList.remove('drop');
        if (effect === 'shake') {
            console.log('Applying shake effect'); // Debugging: output disturbance effect
            problemElement.style.animation = 'shake 0.5s';
            setTimeout(() => problemElement.style.animation = '', 500);
        } else if (effect === 'flip') {
            console.log('Applying flip effect'); // Debugging: output disturbance effect
            problemElement.style.animation = 'flip 1s';
            setTimeout(() => problemElement.style.animation = '', 1000);
        } else if (effect === 'hideKeys') {
            const keys = document.querySelectorAll('.number-button');
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            const originalText = randomKey.textContent;

            randomKey.style.transition = 'transform 0.25s';
            randomKey.style.transform = 'rotateY(90deg)';

            setTimeout(() => {
                randomKey.classList.add('hideKeys-button');
                randomKey.textContent = '🎲';
                randomKey.onclick = typeRandomNumber;
                randomKey.style.transform = 'rotateY(0)';
                randomKey.style.transition = '';
                randomKey.style.transform = '';
            }, 250);

            setTimeout(() => {
                randomKey.style.transition = 'transform 0.25s';
                randomKey.style.transform = 'rotateY(90deg)';
                setTimeout(() => {
                    randomKey.style.backgroundColor = '';
                    randomKey.textContent = originalText;
                    randomKey.onclick = function() { typeNumber(originalText); };
                    randomKey.style.transform = 'rotateY(0)';
                    randomKey.style.transition = '';
                    randomKey.style.transform = '';
                    randomKey.classList.remove('hideKeys-button');
                }, 250);
            }, 3000);
        } else if (effect === 'addSkullButton') {
            const keys = document.querySelectorAll('.number-button');
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            const originalText = randomKey.textContent;

            randomKey.dataset.originalText = originalText;
            randomKey.style.transition = 'transform 0.25s';
            randomKey.style.transform = 'rotateY(90deg)';

            setTimeout(() => {
                randomKey.textContent = '☠️';
                randomKey.classList.add('skull-button');
                randomKey.onclick = endGame;
                randomKey.style.transform = 'rotateY(0)';
                randomKey.style.transform = '';
            }, 250);

            setTimeout(() => {
                if (randomKey.parentNode) {
                    randomKey.style.transition = 'transform 0.25s';
                    randomKey.style.transform = 'rotateY(90deg)';
                    setTimeout(() => {
                        randomKey.textContent = originalText;
                        randomKey.classList.remove('skull-button');
                        randomKey.onclick = function() { typeNumber(originalText); };
                        randomKey.style.transform = 'rotateY(0)';
                        randomKey.style.transition = '';
                        randomKey.style.transform = '';
                    }, 250);
                }
            }, 3000);
        }
        
        if (isReplacing == 0) {
            randomlyReplaceWithEmoji();
        }

        // Schedule the next disturbance
        setTimeout(applyDisturbance, disturbanceInterval);
    }

    // Start the disturbance cycle
    setTimeout(applyDisturbance, disturbanceInterval);
}

function _randomlyReplaceWithEmoji() {
    const originalHTML = problemElement.innerHTML;
    const originalLevel = level;
    const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];

    // Extract the part before and after the equal sign
    const equalIndex = originalHTML.indexOf('=');
    if (equalIndex === -1) return; // If no equal sign is found, do nothing

    const textBeforeEqual = originalHTML.substring(0, equalIndex).trim();
    const textAfterEqual = originalHTML.substring(equalIndex); // This includes the equal sign and everything after it

    // Split the text before the equal sign into words
    const words = textBeforeEqual.split(' ');

    // Filter out elements that are not replaceable
    const replaceableElements = words.filter(el => !['(', ')', '=', '?', ''].includes(el));
    if (replaceableElements.length === 0) return;

    // Select a random word to replace
    const randomIndex = Math.floor(Math.random() * replaceableElements.length);
    const wordToReplace = replaceableElements[randomIndex];

    // Replace the selected word with an emoji
    const replacedWords = words.map(word => (word === wordToReplace ? randomEmoji : word));

    // Reconstruct the HTML
    const newHTML = replacedWords.join(' ') + ' ' + textAfterEqual;
    problemElement.innerHTML = newHTML;

    // Revert back to the original HTML after a delay
    
    setTimeout(() => {
        if (originalLevel == level) {
            problemElement.innerHTML = originalHTML;
        }
    }, 1000 + Math.random() * 1000/level*0.05);
}

function randomlyReplaceWithEmoji() {
    const originalHTML = problemElement.innerHTML;
    const originalLevel = level;
    const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];

    // Find the index of the equal sign
    const equalIndex = originalHTML.indexOf('=');
    if (equalIndex === -1) return; // If no equal sign is found, do nothing

    // Get the text before and after the equal sign
    const textBeforeEqual = originalHTML.substring(0, equalIndex);
    const textAfterEqual = originalHTML.substring(equalIndex); // This includes the equal sign and everything after it

    // Function to get a random replaceable index
    function getRandomReplaceableIndex(text) {
        const replaceableIndices = [];
        for (let i = 0; i < text.length; i++) {
            if (/[0-9+\-*/]/.test(text[i])) {
                replaceableIndices.push(i);
            }
        }
        if (replaceableIndices.length === 0) return null;
        return replaceableIndices[Math.floor(Math.random() * replaceableIndices.length)];
    }

    // Get a random replaceable index
    let randomIndex = getRandomReplaceableIndex(textBeforeEqual);
    if (randomIndex === null) return; // If no replaceable character is found, do nothing

    // Save the original character at the random index
    const originalChar = textBeforeEqual[randomIndex];

    // Replace the character with an emoji
    const replacedText = textBeforeEqual.substring(0, randomIndex) + randomEmoji + textBeforeEqual.substring(randomIndex + 1);

    // Update the problem element with the modified text
    problemElement.innerHTML = replacedText + textAfterEqual;

    // Revert back to the original character after a delay
    setTimeout(() => {
        if (originalLevel == level) {
          const restoredText = textBeforeEqual.substring(0, randomIndex) + originalChar + textBeforeEqual.substring(randomIndex + 1);
          const currentOriginalHTML = problemElement.innerHTML;
          let currentTextAfterEqual = currentOriginalHTML.substring(equalIndex);
          problemElement.innerHTML = restoredText + currentTextAfterEqual;
        }
    }, 1000);
}

function _2randomlyReplaceWithEmoji() {
    const originalHTML = problemElement.innerHTML;
    const originalLevel = level;
    const randomEmoji = () => animalEmojis[Math.floor(Math.random() * animalEmojis.length)];

    // Find the index of the equal sign
    const equalIndex = originalHTML.indexOf('=');
    if (equalIndex === -1) return; // If no equal sign is found, do nothing

    // Get the text before and after the equal sign
    const textBeforeEqual = originalHTML.substring(0, equalIndex);
    const textAfterEqual = originalHTML.substring(equalIndex); // This includes the equal sign and everything after it

    // Function to get replaceable indices
    function getReplaceableIndices(text) {
        const replaceableIndices = [];
        for (let i = 0; i < text.length; i++) {
            if (/[0-9+\-*/]/.test(text[i])) {
                replaceableIndices.push(i);
            }
        }
        return replaceableIndices;
    }

    // Get replaceable indices
    const replaceableIndices = getReplaceableIndices(textBeforeEqual);
    if (replaceableIndices.length === 0) return; // If no replaceable character is found, do nothing

    // Determine the number of characters to replace based on the level
    const maxReplacements = Math.min(3, Math.floor(level / 10) + 1);
    const numReplacements = Math.min(maxReplacements, replaceableIndices.length);
    
    // Randomly select indices to replace
    const selectedIndices = [];
    while (selectedIndices.length < numReplacements) {
        const randomIndex = replaceableIndices[Math.floor(Math.random() * replaceableIndices.length)];
        if (!selectedIndices.includes(randomIndex)) {
            selectedIndices.push(randomIndex);
        }
    }

    // Save the original characters at the selected indices
    const originalChars = selectedIndices.map(index => textBeforeEqual[index]);

    // Replace the selected characters with emojis
    let replacedText = textBeforeEqual.split('');
    selectedIndices.forEach(index => {
        replacedText[index] = randomEmoji();
    });
    replacedText = replacedText.join('');

    // Update the problem element with the modified text
    problemElement.innerHTML = replacedText + textAfterEqual;

    // Revert back to the original characters after a delay
    setTimeout(() => {
        if (originalLevel == level) {
            let restoredText = textBeforeEqual.split('');
            selectedIndices.forEach((index, i) => {
                restoredText[index] = originalChars[i];
            });
            restoredText = restoredText.join('');
            const currentOriginalHTML = problemElement.innerHTML;
            let currentTextAfterEqual = currentOriginalHTML.substring(equalIndex);
            problemElement.innerHTML = restoredText + currentTextAfterEqual;
        }
    }, 1000 + Math.random() * 1000/level*0.05);
}



function typeNumber(num) {
    let answerPlaceholderElement = document.getElementById('answer-placeholder');
    if (answerPlaceholderElement.textContent === '?') {
        answerPlaceholderElement.textContent = '';
    }
    answerPlaceholderElement.textContent += num;
}

function typeRandomNumber() {
    const randomNum = Math.floor(Math.random() * 10);
    typeNumber(randomNum);
}

function clearAnswer() {
    let answerPlaceholderElement = document.getElementById('answer-placeholder');
    answerPlaceholderElement.textContent = '?';
}
