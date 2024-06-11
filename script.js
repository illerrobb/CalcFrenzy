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
let problemContainer = document.querySelector('.problem-container');

let timer;
let timerDuration = 10;
let timeLeft;
let currentProblem;
let currentAnswer;
let nextProblem;
let nextAnswer;
let isPlaying;
const disturbanceFrequency = 0.15; // Probabilità di disturbo ad ogni secondo
const animalEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'];

// *** FUNZIONI DI GIOCO ***
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
    startDisturbances();
    isPlaying = true;
}

function restartGame() {
    clearInterval(timer);
    stopDisturbances(); // Assicurati di fermare i disturbi
    resetKeys(); // Reimposta i tasti allo stato originale
    clearEmoji(); // Rimuovi eventuali emoji residue
    startGame(); // Avvia una nuova partita
}

function endGame() {
    clearInterval(timer);
    gameElement.style.display = 'none';
    endgameElement.style.display = 'flex';
    scoreElement.textContent = score;
    clearEmoji();
    isPlaying = false;
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
    problemElement.id = "old-problem";
    problemElement.className = "problem";
    let oldProblemElement = document.getElementById('old-problem');

    setTimeout(() => {
        oldProblemElement.remove();
    }, 200)
    

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
        addTime(3);
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

// *** FUNZIONI DISTURBO ***
function startDisturbances() {
    setInterval(applyRandomDisturbance, 1000); // Controlla ogni secondo per un nuovo disturbo
}

function stopDisturbances() {
    // (Implementazione per interrompere i disturbi, ad esempio, usando clearInterval)
}

function applyRandomDisturbance() {
    if (Math.random() < disturbanceFrequency && isPlaying) {
      const disturbanceFunctions = [shakeProblem, flipProblem, hideRandomKey, addSkullButton, randomlyReplaceWithEmoji];
      const randomIndex = Math.floor(Math.random() * disturbanceFunctions.length);
      disturbanceFunctions[randomIndex]();
    }
}
  

function shakeProblem() {
    problemElement.style.animation = 'shake 0.5s';
    setTimeout(() => problemElement.style.animation = '', 500);
}

function flipProblem() {
    problemElement.style.animation = 'flip 1s';
    setTimeout(() => problemElement.style.animation = '', 1000);
}

function hideRandomKey() {
    const keyId = `key_${Math.floor(Math.random() * 10) + 1}`; // Genera un ID casuale da num_1 a num_10
    const randomKey = document.getElementById(keyId);

    if (randomKey) { // Assicurati che la chiave esista
        const originalText = randomKey.textContent;

        randomKey.style.transition = 'transform 0.25s';
        randomKey.style.transform = 'rotateY(90deg)';

        setTimeout(() => {
            randomKey.classList.add('hideKeys-button');
            randomKey.textContent = '🎲';
            randomKey.onclick = typeRandomNumber;
            randomKey.style.transform = 'rotateY(0)';
            randomKey.style.transition = '';
        }, 250);

        setTimeout(() => {
            randomKey.style.transition = 'transform 0.25s';
            randomKey.style.transform = 'rotateY(90deg)';
            setTimeout(() => {
                resetKey(randomKey, originalText);
            }, 250);
        }, 3000);
    }
}

function addSkullButton() {
    const keyId = `key_${Math.floor(Math.random() * 10 + 1)}`; // Genera un ID casuale da key_1 a 9
    const randomKey = document.getElementById(keyId);

    if (randomKey) { // Assicurati che la chiave esista
        const originalText = randomKey.textContent;

        randomKey.dataset.originalText = originalText;
        //randomKey.style.transition = 'transform 0.25s';
        randomKey.style.transform = 'rotateY(90deg)';

        setTimeout(() => {
            randomKey.textContent = '☠️';
            randomKey.classList.add('skull-button');
            randomKey.onclick = endGame;
            randomKey.style.transform = 'rotateY(0)';
        }, 250);

        setTimeout(() => {
            if (randomKey.parentNode) {
                //randomKey.style.transition = 'transform 0.25s';
                randomKey.style.transform = 'rotateY(90deg)';
                setTimeout(() => {
                    resetKey(randomKey, originalText);
                }, 250);
            }
        }, 3000);
    }
}

function resetKey(keyElement, originalText) {
    keyElement.style.backgroundColor = '';
    keyElement.textContent = originalText;
    keyElement.onclick = function() { typeNumber(originalText); };
    keyElement.style.transform = 'rotateY(0)';
    keyElement.style.transition = '';
    keyElement.style.transform = '';
    keyElement.classList.remove('hideKeys-button', 'skull-button');
}

function resetKeys() {
    for (let i = 1; i <= 10; i++) {
        const keyId = `key_${i}`;
        const keyElement = document.getElementById(keyId);
        if (keyElement) {
            if (keyId == 10) {
                resetKey(keyElement, 10)  
            }
            else {
                resetKey(keyElement, i); // Reimposta ogni tasto al suo stato originale
            }
        }
    }
}

function randomlyReplaceWithEmoji() {
  const randomEmojiElement = document.createElement('div');
  const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
  randomEmojiElement.textContent = randomEmoji;
  randomEmojiElement.classList.add('emoji-overlay');

  // Posizionamento e rotazione random
  const containerRect = problemContainer.getBoundingClientRect();
  const emojiSize = 50; // Dimensione approssimativa dell'emoji
  const maxX = containerRect.width - 100 - emojiSize;
  const maxY = containerRect.height - 100 - emojiSize;
  const yFromTop = containerRect.top;

  randomEmojiElement.style.left = Math.random() * maxX + yFromTop + 'px';
  randomEmojiElement.style.top = Math.random() * maxY + yFromTop + 'px';
  randomEmojiElement.style.fontSize = (2.5 + 2 * Math.random()) + 'em';
  randomEmojiElement.style.transform = `rotate(${Math.random() * 90 - 45}deg)`;

  // Aggiunta al DOM e gestione del click per rimuovere
  problemContainer.appendChild(randomEmojiElement);

  randomEmojiElement.addEventListener('click', () => {
    randomEmojiElement.style.transition = 'opacity 0.1s ease-out';
    randomEmojiElement.style.opacity = '0';
    setTimeout(() => {
      randomEmojiElement.remove();
    }, 500);
  });
}

function clearEmoji() {
    const emojiElements = document.querySelectorAll('.emoji-overlay');
    emojiElements.forEach(function(element) {
        element.remove();
    });
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
