let problemElement = document.getElementById('problem');
let answerElement = document.getElementById('answer');
let resultElement = document.getElementById('result');
let timerElement = document.getElementById('timer');
let levelElement = document.getElementById('level');
let menuElement = document.getElementById('menu');
let gameElement = document.getElementById('game');
let endgameElement = document.getElementById('endgame');
let scoreElement = document.getElementById('score');

let currentProblem;
let timer;
let timeLeft = 10;
let level = 1;
let score = 0;

const animalEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'];
const disturbanceEffects = ['shake', 'flip', 'hideKeys', 'addSkullButton'];

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
}

function endGame() {
    gameElement.style.display = 'none';
    endgameElement.style.display = 'block';
    scoreElement.textContent = score;
}

function generateProblem() {
    const operators = ['+', '-', '*'];

    function getRandomNumber() {
        return Math.floor(Math.random() * (5 + level*0.5));
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

        // Decidi casualmente se mettere la parte complessa all'inizio o alla fine
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

    do {
        const complexProbability = Math.min(level / 80, 0.5); // Incrementa la probabilità fino al 50%
        const doubleComplexProbability = Math.min(level / 160, 0.3); // Incrementa la probabilità fino al 30%
        const randomValue = Math.random();

        if (randomValue < doubleComplexProbability) {
            expression = createDoubleComplexExpression();
        } else if (randomValue < complexProbability) {
            expression = createComplexExpression();
        } else {
            expression = createSimpleExpression();
        }

        result = evaluateExpression(expression);
    } while (result < 0 || isNaN(result));

    return expression;
}

function displayProblem() {
    currentProblem = generateProblem();
    problemElement.textContent = `${currentProblem} = ?`;

    // Rimuovi tutte le classi di animazione per resettare lo stato
    problemElement.classList.remove('drop', 'shake', 'flip');
    void problemElement.offsetWidth; // Trigger reflow to restart animation

    // Aggiungi solo l'animazione di drop
    problemElement.classList.add('drop');

    const disturbanceFrequency = Math.min(level / 10, 0.5); // Incrementa la frequenza fino al 50%
    if (Math.random() < disturbanceFrequency) {
        setTimeout(randomlyReplaceWithEmoji, Math.random() * 5000);
        setTimeout(applyRandomDisturbance, Math.random() * 5000);
    }
}



function typeNumber(num) {
    answerElement.value += num;
}

function clearAnswer() {
    answerElement.value = '';
}

function evaluateExpression(expression) {
    try {
        const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');
        return new Function(`return ${sanitizedExpression}`)();
    } catch (error) {
        return NaN;
    }
}

function submitAnswer() {
    let userAnswer = parseFloat(answerElement.value);
    let correctAnswer = evaluateExpression(currentProblem);

    if (isNaN(correctAnswer)) {
        resultElement.textContent = 'Error in calculation';
        return;
    }

    if (userAnswer === correctAnswer) {
        resultElement.textContent = 'Correct!';
        level++;
        score += 10;
        levelElement.textContent = level;
        displayProblem();
        resetTimer();
    } else {
        problemElement.style.animation = 'shake 0.3s';
        setTimeout(() => problemElement.style.animation = '', 500);
        resultElement.textContent = 'Incorrect, try again.';
    }
    answerElement.value = '';
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = 10;
    timerElement.style.width = '100%';
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerElement.style.width = (timeLeft / 10) * 100 + '%';
    if (timeLeft <= 0) {
        clearInterval(timer);
        resultElement.textContent = 'Time is up! You lost.';
        setTimeout(endGame, 2000);
    }
}

function randomlyReplaceWithEmoji() {
    const originalText = problemElement.textContent;
    const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
    const elements = originalText.split(' ');

    // Filtra gli elementi che non sono parentesi
    const replaceableElements = elements.filter(el => !['(', ')', '=', '?'].includes(el));
    const randomIndex = Math.floor(Math.random() * replaceableElements.length);

    // Trova l'elemento effettivo nell'array originale e sostituiscilo
    const elementToReplace = replaceableElements[randomIndex];
    const elementIndex = elements.indexOf(elementToReplace);

    elements[elementIndex] = randomEmoji;
    problemElement.textContent = elements.join(' ');

    setTimeout(() => {
        problemElement.textContent = originalText;
    }, 1000);
}

function applyRandomDisturbance() {
    const effect = disturbanceEffects[Math.floor(Math.random() * disturbanceEffects.length)];
    problemElement.classList.remove('drop'); // Rimuove l'animazione di drop prima di applicare le altre
    if (effect === 'shake') {
        problemElement.style.animation = 'shake 0.5s';
        setTimeout(() => problemElement.style.animation = '', 500);
    } else if (effect === 'flip') {
        problemElement.style.animation = 'flip 1s';
        setTimeout(() => problemElement.style.animation = '', 1000);
    } else if (effect === 'hideKeys') {
        const keys = document.querySelectorAll('.number-button');
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        randomKey.style.visibility = 'hidden';
        setTimeout(() => randomKey.style.visibility = 'visible', 1000);
    } else if (effect === 'addSkullButton') {
        const keys = document.querySelectorAll('.number-button');
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const originalText = randomKey.textContent;

        randomKey.textContent = '☠️';
        randomKey.classList.add('skull-button');
        randomKey.onclick = endGame;

        setTimeout(() => {
            if (randomKey.parentNode) {
                randomKey.textContent = originalText;
                randomKey.classList.remove('skull-button');
                randomKey.onclick = function() { typeNumber(originalText); };
            }
        }, 3000);
    }
}

// Show the menu initially
menuElement.style.display = 'block';
gameElement.style.display = 'none';
endgameElement.style.display = 'none';
