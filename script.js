let problemElement = document.getElementById('problem');
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
const disturbanceEffects = ['shake', 'flip', 'hideKeys', 'addSkullButton'];
const animalEmojis = ['shake', 'flip', 'hideKeys', 'addSkullButton'];

function startGame() {
    menuElement.style.display = 'none';
    gameElement.style.display = 'block';
    endgameElement.style.display = 'none';
    level = 1;
    score = 0;
    levelElement.textContent = level;
    displayProblem();
    resetTimer();
}

function restartGame() {
    menuElement.style.display = 'none';
    gameElement.style.display = 'block';
    endgameElement.style.display = 'none';
    level = 1;
    score = 0;
    levelElement.textContent = level;
    displayProblem();
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
        return Math.floor(Math.random() * (3 + level * 0.35));
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
    const maxResult = 10 + level * 3; // Incrementa la difficoltà con il livello

    do {
        const complexProbability = Math.min(level / 80, 0.5);
        const doubleComplexProbability = Math.min(level / 160, 0.3);
        const randomValue = Math.random();

        if (randomValue < doubleComplexProbability) {
            expression = createDoubleComplexExpression();
        } else if (randomValue < complexProbability) {
            expression = createComplexExpression();
        } else {
            expression = createSimpleExpression();
        }

        result = evaluateExpression(expression);
    } while (result < 0 || isNaN(result) || result > maxResult);

    currentAnswer = result;
    return expression;
}

function displayProblem() {
    currentProblem = generateProblem();
    problemElement.innerHTML = `${currentProblem} = <span id="answer-placeholder">?</span>`;

    // Rimuovi le animazioni precedenti
    problemElement.classList.remove('drop', 'shake', 'flip');
    //void problemElement.offsetWidth; // Reflow for restarting animations

    // Aggiungi l'animazione di drop solo se non c'è stato un errore recente
    if (!resultElement.textContent.includes('Incorrect')) {
        //problemElement.classList.add('drop');
    }

    const disturbanceFrequency = Math.min(level / 10, 0.5);
    if (Math.random() < disturbanceFrequency) {
        setTimeout(applyRandomDisturbance, Math.random() * 5000);
    }
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
        displayProblem();
        resetTimer();
    } else {
        problemElement.style.animation = 'shake 0.5s';
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
    const effect = disturbanceEffects[Math.floor(Math.random() * disturbanceEffects.length)];
    problemElement.classList.remove('drop');
    if (effect === 'shake') {
        problemElement.style.animation = 'shake 0.5s';
        setTimeout(() => problemElement.style.animation = '', 500);
    } else if (effect === 'flip') {
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
        }, 250);

        setTimeout(() => {
            randomKey.style.transition = 'transform 0.25s';
            randomKey.style.transform = 'rotateY(90deg)';
            setTimeout(() => {
                randomKey.style.backgroundColor = '';
                randomKey.textContent = originalText;
                randomKey.classList.remove('hideKeys-button');
                randomKey.onclick = function() { typeNumber(originalText); };
                randomKey.style.transform = 'rotateY(0)';
                randomKey.style.transition = '';
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
                }, 250);
            }
        }, 3000);
    }
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
