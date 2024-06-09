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
let timeLeft = 8;
let currentProblem;
let currentAnswer;
let nextProblem;
let nextAnswer;
const disturbanceFrequency = Math.min(level / 10, 0.5);
const disturbanceEffects = ['shake', 'flip', 'hideKeys', 'addSkullButton'];

function startGame() {
    menuElement.style.display = 'none';
    gameElement.style.display = 'block';
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
    gameElement.style.display = 'block';
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
    endgameElement.style.display = 'block';
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
        resetTimer();
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
    timeLeft = 8;
    resultElement.textContent = timeLeft;
    timerElement.style.width = '100%';
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerElement.style.width = ((timeLeft)/8) * 100 + '%';
    resultElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timer);
        resultElement.textContent = 'Time is up! You lost.';
        setTimeout(endGame, 15);
    }
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

        // Schedule the next disturbance
        setTimeout(applyDisturbance, disturbanceInterval);
    }

    // Start the disturbance cycle
    setTimeout(applyDisturbance, disturbanceInterval);
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
