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
let disturbanceActive = false; // Flag per indicare se un disturbo è attivo
let disturbanceIntervals = [];

// Frequenze di disturbo (valori tra 0 e 1)
const disturbanceFrequencies = {
    hideRandomKey: 0.15,
    addSkullButton: 0.1,
    randomlyReplaceWithEmoji: 0.2,
    swapKeys: 0.12,
    lockKey: 0.08,
    feedTheAnimal: 0.1
};

const animalEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'];
let keysUnderDisturbance = {}; 

// Dati per il gioco "Feed the Animal"
const animalData = {
    '🐶': ['🍖', '🍎', '🥕'],
    '🐱': ['🐟', '🥛', '🌿'],
    '🐭': ['🧀', '🍪', '🍓'],
    '🐹': ['🌻', '🌽', '🥒'],
    '🐰': ['🥕', '🥬', '🥦'],
    '🦊': ['🍗', '🍇', '🍄'],
    '🐻': ['🍯', '🐟', '🐝']
};

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
    stopDisturbances();
    resetKeys();
    clearEmoji();
    startGame();
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
    const maxResult = 10 + level * 0.5; 

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
    
    console.log('nextAnswer:', nextAnswer); 
    console.log('currentAnswer:', currentAnswer); 
}

function displayProblems() {
    problemElement.innerHTML = `${currentProblem} = <span id="answer-placeholder">?</span>`;
    nextProblemElement.innerHTML = `${nextProblem} = ?`;
}

function handleCorrectAnswer() {
    problemElement.id = "old-problem";
    problemElement.className = "problem";
    let oldProblemElement = document.getElementById('old-problem');

    setTimeout(() => {
        oldProblemElement.remove();
    }, 200)
    

    nextProblemElement.id = 'problem';
    nextProblemElement.className = 'problem';
    nextProblemElement.innerHTML = `${nextProblem} = <span id="answer-placeholder">?</span>`;
    
    let newNextProblemElement = document.createElement('p');
    newNextProblemElement.id = 'next-problem';
    newNextProblemElement.className = 'problem';

    document.querySelector('.problem-container').prepend(newNextProblemElement);

    problemElement = document.getElementById('problem');
    nextProblemElement = document.getElementById('next-problem');
    
    problemElement.style.animation = 'drop 0.5s';
    setTimeout(() => problemElement.style.animation = '', 500);       
    nextProblemElement.style.animation = 'drop 0.5s';
    setTimeout(() => nextProblemElement.style.animation = '', 500);
    
    currentProblem = nextProblem;
    currentAnswer = nextAnswer;
    
    let next = generateProblem();
    nextProblem = next.expression;
    nextAnswer = next.result;
    console.log('nextAnswer:', nextAnswer);
    console.log('currentAnswer:', currentAnswer);

    nextProblemElement.innerHTML = `${nextProblem} = ?`;
}

function submitAnswer() {
    let answerPlaceholderElement = document.getElementById('answer-placeholder');
    let userAnswer = parseFloat(answerPlaceholderElement.textContent);

    console.log('Expected:', currentAnswer);
    console.log('User Answer:', userAnswer);

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
    clearInterval(timer); // Cancella il timer precedente, se esiste
    timeLeft = timerDuration;
    resultElement.textContent = timeLeft;
    timerElement.style.width = '100%';
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerElement.style.width = ((timeLeft) / timerDuration) * 100 + '%';
    resultElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timer);
        resultElement.textContent = 'Time is up! You lost.';
        setTimeout(endGame, 15);
    }
    consolo.log('TI')
}

function addTime(seconds) {
    timeLeft += seconds;
    if (timeLeft > timerDuration) timeLeft = timerDuration;
    // If the timer is not already running, start it
    timer = setInterval(updateTimer, 1000);
    // Aggiorna solo la barra del timer e il testo
    timerElement.style.width = ((timeLeft) / timerDuration) * 100 + '%';
    resultElement.textContent = timeLeft;
}

// *** FUNZIONI DISTURBO ***
function startDisturbances() {
    for (const disturbance in disturbanceFrequencies) {
        disturbanceIntervals.push(setInterval(() => {
            applyDisturbance(disturbance, disturbanceFrequencies[disturbance]);
        }, 1000));
    }
}

function stopDisturbances() {
    disturbanceIntervals.forEach(intervalId => clearInterval(intervalId));
    disturbanceIntervals = [];
}

function applyDisturbance(disturbanceName, frequency) {
    if (Math.random() < frequency && isPlaying && !disturbanceActive) {
        disturbanceActive = true;
        switch (disturbanceName) {
            case 'hideRandomKey':
                hideRandomKey();
                break;
            case 'addSkullButton':
                addSkullButton();
                break;
            case 'randomlyReplaceWithEmoji':
                randomlyReplaceWithEmoji();
                break;
            case 'swapKeys':
                swapKeys();
                break;
            case 'lockKey':
                lockKey();
                break;
            case 'feedTheAnimal':
                feedTheAnimal();
                break;
        }
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

function isKeyUnderDisturbance(keyId) {
    return keysUnderDisturbance[keyId];
}

function setKeyDisturbance(keyId, value) {
    keysUnderDisturbance[keyId] = value;
}


function feedTheAnimal() {
    // Crea l'overlay scuro
    const overlay = document.createElement('div');
    overlay.classList.add('feed-the-animal-overlay');

    // Scegli un animale casuale
    const animalKeys = Object.keys(animalData);
    const randomAnimalIndex = Math.floor(Math.random() * animalKeys.length);
    const animal = animalKeys[randomAnimalIndex];

    // Crea l'elemento animale
    const animalElement = document.createElement('div');
    animalElement.classList.add('feed-the-animal-animal');
    animalElement.textContent = animal;

    // Crea gli elementi cibo in ordine casuale
    const foodEmojis = [...animalData[animal]]; 
    shuffleArray(foodEmojis); 

    const foodElements = foodEmojis.map(food => {
        const foodElement = document.createElement('div');
        foodElement.classList.add('feed-the-animal-food');
        foodElement.textContent = food;
        foodElement.setAttribute('draggable', true);
        return foodElement;
    });

    // Crea il contenitore per il cibo
    const foodContainer = document.createElement('div');
    foodContainer.style.display = 'flex';
    foodContainer.style.marginTop = '20px';
    foodElements.forEach(foodElement => foodContainer.appendChild(foodElement));

    // Aggiungi l'animale e il cibo all'overlay
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('feed-the-animal-popup');
    popupContainer.appendChild(animalElement);
    popupContainer.appendChild(foodContainer);
    overlay.appendChild(popupContainer);

    // Gestisci l'evento di rilascio sull'animale
    animalElement.ondragover = (event) => event.preventDefault();
    animalElement.ondrop = (event) => {
        event.preventDefault();
        const droppedFood = event.dataTransfer.getData('text/plain');

        if (animalData[animal][0] === droppedFood) {
            animalElement.textContent = '😋';
            setTimeout(() => {
                document.body.removeChild(overlay);
                disturbanceActive = false;
            }, 500);
            addTime(2);
        } else {
            animalElement.style.animation = 'shake 0.2s';
            setTimeout(() => animalElement.style.animation = '', 200);

            const originalFoodElement = foodElements.find(el => el.textContent === droppedFood);
            foodContainer.appendChild(originalFoodElement);
        }
    };

    // Aggiungi l'overlay al documento PRIMA di gestire il trascinamento
    document.body.appendChild(overlay); 

    // Aggiungi eventi di trascinamento
    foodElements.forEach(foodElement => {
        foodElement.ondragstart = (event) => {
            event.dataTransfer.setData('text/plain', food);
            event.target.style.display = 'none';

            // Crea un'immagine dell'emoji che segue il cursore
            const dragImage = document.createElement('div');
            dragImage.textContent = food;
            dragImage.style.position = 'absolute';
            dragImage.style.fontSize = '3em';
            dragImage.style.pointerEvents = 'none';

            // Aggiungi l'immagine di trascinamento all'overlay
            overlay.appendChild(dragImage); 

            event.dataTransfer.setDragImage(dragImage, 0, 0);
        };

        foodElement.ondragend = (event) => {
            event.target.style.display = '';

            // Rimuovi l'immagine di trascinamento dall'overlay
            overlay.removeChild(overlay.querySelector('.feed-the-animal-food')); 
        };
    });
}

// Funzione per mescolare un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function hideRandomKey() {
    const keys = Object.keys(keysUnderDisturbance);
    const availableKeys = Array.from(document.querySelectorAll('.number-button')).filter(key => !keys.includes(key.id));

    if (availableKeys.length > 0) {
        const randomKeyIndex = Math.floor(Math.random() * availableKeys.length);
        const randomKey = availableKeys[randomKeyIndex];
        const keyId = randomKey.id;
        const originalText = parseInt(randomKey.textContent, 10);

        setKeyDisturbance(keyId, true);

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
                setKeyDisturbance(keyId, false);
            }, 250);
        }, 3000);
    }
}

function addSkullButton() {
    const keys = Object.keys(keysUnderDisturbance);
    const availableKeys = Array.from(document.querySelectorAll('.number-button')).filter(key => !keys.includes(key.id));

    if (availableKeys.length > 0) {
        const randomKeyIndex = Math.floor(Math.random() * availableKeys.length);
        const randomKey = availableKeys[randomKeyIndex];
        const keyId = randomKey.id;
        const originalText = parseInt(randomKey.textContent, 10);

        setKeyDisturbance(keyId, true); 

        randomKey.dataset.originalText = originalText;
        randomKey.style.transform = 'rotateY(90deg)';

        setTimeout(() => {
            randomKey.textContent = '☠️';
            randomKey.classList.add('skull-button');
            randomKey.onclick = endGame;
            randomKey.style.transform = 'rotateY(0)';
        }, 250);

        setTimeout(() => {
            if (randomKey.parentNode) {
                randomKey.style.transform = 'rotateY(90deg)';
                setTimeout(() => {
                    resetKey(randomKey, originalText);
                    setKeyDisturbance(keyId, false);
                }, 250);
            }
        }, 3000);
    }
}

function swapKeys() {
    const numberKeys = Array.from(document.querySelectorAll('.number-button:not(.hideKeys-button):not(.skull-button)'));

    function getRandomKeyIndex(excludeIndex = -1) {
        let index = Math.floor(Math.random() * numberKeys.length);
        while (index === excludeIndex) {
            index = Math.floor(Math.random() * numberKeys.length);
        }
        return index;
    }

    // Scegli due tasti casuali, assicurandoti che siano diversi
    let key1Index = getRandomKeyIndex();
    let key2Index = getRandomKeyIndex(key1Index);

    // Se un tasto ha un disturbo attivo, scegline un altro a caso
    if (isKeyUnderDisturbance(numberKeys[key1Index].id)) {
        key1Index = getRandomKeyIndex(key2Index); // Assicurati che key1Index sia diverso da key2Index
    } else if (isKeyUnderDisturbance(numberKeys[key2Index].id)) {
        key2Index = getRandomKeyIndex(key1Index); // Assicurati che key2Index sia diverso da key1Index
    }

    const key1 = numberKeys[key1Index];
    const key2 = numberKeys[key2Index];

    // Imposta i tasti come in disturbo
    setKeyDisturbance(key1.id, true);
    setKeyDisturbance(key2.id, true);

    const originalText1 = key1.textContent;
    const originalText2 = key2.textContent;

    // Applica lo stile viola e cambia l'ombra
    key1.classList.add('swap-button');
    key2.classList.add('swap-button');


    // Scambia i testi
    key1.textContent = originalText2;
    key2.textContent = originalText1;

    // Esegui il flip per lo scambio (opzionale, solo visivo)
    key1.style.transition = 'transform 0.5s';
    key2.style.transition = 'transform 0.5s';
    key1.style.transform = 'rotateY(180deg)';
    key2.style.transform = 'rotateY(180deg)';
    setTimeout(() => {
        key1.style.transform = 'rotateY(0deg)';
        key2.style.transform = 'rotateY(0deg)';
    }, 500);

    // Ripristina lo stile originale dopo un ritardo
    setTimeout(() => {
        resetKey(key1, originalText1);
        resetKey(key2, originalText2);
        key1.style.transform = 'rotateY(0deg)';
        key2.style.transform = 'rotateY(0deg)';
        setKeyDisturbance(key1.id, false);
        setKeyDisturbance(key2.id, false);
    }, 3000);
}

function lockKey() {
    const numberKeys = Array.from(document.querySelectorAll('.number-button:not(.hideKeys-button):not(.skull-button)'));

    // Trova un tasto senza disturbi attivi
    const availableKeys = numberKeys.filter(key => !isKeyUnderDisturbance(key.id));

    if (availableKeys.length > 0) {
        const randomKeyIndex = Math.floor(Math.random() * availableKeys.length);
        const randomKey = availableKeys[randomKeyIndex];
        const keyId = randomKey.id;
        const originalText = randomKey.textContent;

        setKeyDisturbance(keyId, true);

        // Crea l'elemento emoji del lucchetto
        const lockEmoji = document.createElement('span');
        lockEmoji.textContent = '🔒';
        lockEmoji.style.position = 'absolute';
        lockEmoji.style.fontSize = '1em'; 

        // Applica lo stile al tasto bloccato
        randomKey.classList.add('lock-button'); // applica 
        randomKey.appendChild(lockEmoji); 

        let tapCount = 0;
        const maxTaps = 3;

        // Aggiungi un gestore di eventi 'click' al tasto bloccato
        randomKey.onclick = () => {
            tapCount++;
            randomKey.style.animation = 'shake 0.1s'; // Fai shakerare il pulsante ad ogni tocco
            setTimeout(() => randomKey.style.animation = '', 200);

            if (tapCount >= maxTaps) {
                // Ripristina il tasto
                resetKey(randomKey, originalText);
                setKeyDisturbance(keyId, false);
                randomKey.onclick = function() { typeNumber(originalText); }; 
                lockEmoji.remove(); // Rimuovi l'emoji del lucchetto
                addTime(2);
            }
        };
    }
}

function resetKey(keyElement, originalText) {
    keyElement.style.backgroundColor = '';
    keyElement.textContent = originalText;
    keyElement.onclick = function() { typeNumber(originalText); };
    keyElement.style.transform = 'rotateY(0)';
    keyElement.style.transition = '';
    keyElement.style.transform = '';
    keyElement.classList.remove('hideKeys-button', 'skull-button', 'swap-button', 'lock-button');
}

function resetKeys() {
    for (let i = 1; i <= 10; i++) {
        const keyId = `key_${i}`;
        const keyElement = document.getElementById(keyId);
        if (keyElement) {
            if (i == 10) {
                resetKey(keyElement, 0)  
            }
            else {
                resetKey(keyElement, i); 
            }
        }
    }
    keysUnderDisturbance = {}; 
}

function randomlyReplaceWithEmoji() {
  const randomEmojiElement = document.createElement('div');
  const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
  randomEmojiElement.textContent = randomEmoji;
  randomEmojiElement.classList.add('emoji-overlay');

  const containerRect = problemContainer.getBoundingClientRect();
  const emojiSize = 50;
  const maxX = containerRect.width - 100 - emojiSize;
  const maxY = containerRect.height - 100 - emojiSize;
  const yFromTop = containerRect.top;

  randomEmojiElement.style.left = Math.random() * maxX + yFromTop + 'px';
  randomEmojiElement.style.top = Math.random() * maxY + yFromTop + 'px';
  randomEmojiElement.style.fontSize = (2.5 + 2 * Math.random()) + 'em';
  randomEmojiElement.style.transform = `rotate(${Math.random() * 90 - 45}deg)`;

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
