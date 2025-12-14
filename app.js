// State management
const state = {
    currentQuestion: 0,
    answers: {},
    materialSides: {
        total: 0,
        current: 0,
        materials: {}
    }
};

// Vragen en opties
const questions = [
    {
        id: 'woning',
        text: 'Wat voor woning heeft u?',
        type: 'buttons',
        options: ['Tussenwoning', 'Hoekwoning', 'Appartement', 'Vrijstaande woning', 'Twee-onder-een-kap', 'Weet ik niet'],
        hasMoreOptions: true
    },
    {
        id: 'plaatsing',
        text: 'Waar wilt u de schuifwand plaatsen?',
        type: 'buttons',
        options: ['Veranda aan achterkant', 'Tuinkamer / serre', 'Balkon of dakterras', 'Tegen de achtergevel van de woning', 'Anders']
    },
    {
        id: 'zijdes',
        text: 'Hoeveel zijdes worden afgesloten?',
        type: 'buttons',
        options: ['1 zijde', '2 zijdes', '3 zijdes', 'Alle zijdes']
    },
    {
        id: 'materiaal',
        text: '', // Wordt dynamisch aangepast
        type: 'buttons',
        options: ['Glas', 'Polycarbonaat', 'Aluminium', 'Anders']
    },
    {
        id: 'verwarming',
        text: 'Hoe verwarmt u de ruimte binnenshuis?',
        type: 'buttons',
        options: ['Cv-ketel', 'Warmtepomp', 'Vloerverwarming', 'Elektrische kachel', 'Geen verwarming'],
        hasMoreOptions: true
    },
    {
        id: 'isolatie',
        text: 'Hoe goed is uw huidige isolatie?',
        type: 'buttons',
        options: ['Goed', 'Gemiddeld', 'Slecht', 'Geen idee']
    },
    {
        id: 'grootte',
        text: 'Hoe groot is de opening of ruimte?',
        type: 'text'
    },
    {
        id: 'energiekosten',
        text: 'Wat zijn uw gemiddelde maandelijkse energiekosten?',
        type: 'text'
    },
    {
        id: 'kamer',
        text: 'Welke kamer zit er achter de schuifwand?',
        type: 'buttons',
        options: ['Woonkamer', 'Keuken', 'Eetkamer', 'Kantoor', 'Slaapkamer', 'Anders'],
        hasMoreOptions: true
    },
    {
        id: 'reden',
        text: 'Waarom wilt u meer warmte behouden?',
        type: 'buttons',
        options: ['Besparen op energiekosten', 'Meer comfort in huis', 'Minder tocht', 'Anders']
    }
];

// DOM elementen
const chatMessages = document.getElementById('chatMessages');
const chatSuggestions = document.getElementById('chatSuggestions');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Hulpvariabelen voor "Meer opties"
let showingMoreOptions = false;
let currentQuestionOptions = [];

// Initialisatie
function init() {
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
    
    // Start met openingstekst
    showBotMessage('Hoi! Zullen we samen kijken hoeveel warmte je kunt besparen met je overkapping en glazen schuifwanden? Ik stel je eerst een paar korte vragen. Je kunt steeds een knop kiezen of zelf typen.');
    
    // Start met eerste vraag
    setTimeout(() => {
        askQuestion(0);
    }, 500);
}

// Toon bot bericht
function showBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Toon gebruiker bericht
function showUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Scroll naar beneden
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Toon knoppen
function showButtons(options, showMoreButton = false) {
    chatSuggestions.innerHTML = '';
    
    if (options.length === 0) {
        return;
    }
    
    // Maximaal 4 knoppen (of 3 + "Meer opties")
    const buttonsToShow = showMoreButton && options.length > 3 ? 3 : Math.min(4, options.length);
    
    for (let i = 0; i < buttonsToShow; i++) {
        const button = document.createElement('button');
        button.className = 'suggestion-button';
        button.textContent = options[i];
        button.addEventListener('click', () => handleButtonClick(options[i]));
        chatSuggestions.appendChild(button);
    }
    
    // "Meer opties" knop
    if (showMoreButton && options.length > 3 && !showingMoreOptions) {
        const moreButton = document.createElement('button');
        moreButton.className = 'suggestion-button';
        moreButton.textContent = 'Meer opties';
        moreButton.addEventListener('click', () => showMoreOptions(options));
        chatSuggestions.appendChild(moreButton);
    }
}

// Toon meer opties
function showMoreOptions(allOptions) {
    showingMoreOptions = true;
    chatSuggestions.innerHTML = '';
    
    // Toon resterende opties (max 4)
    const remainingOptions = allOptions.slice(3);
    const buttonsToShow = Math.min(4, remainingOptions.length);
    
    for (let i = 0; i < buttonsToShow; i++) {
        const button = document.createElement('button');
        button.className = 'suggestion-button';
        button.textContent = remainingOptions[i];
        button.addEventListener('click', () => {
            showingMoreOptions = false;
            handleButtonClick(remainingOptions[i]);
        });
        chatSuggestions.appendChild(button);
    }
    
    // "Terug" knop
    const backButton = document.createElement('button');
    backButton.className = 'suggestion-button';
    backButton.textContent = 'Terug';
    backButton.addEventListener('click', () => {
        showingMoreOptions = false;
        askQuestion(state.currentQuestion);
    });
    chatSuggestions.appendChild(backButton);
}

// Verwijder knoppen
function clearButtons() {
    chatSuggestions.innerHTML = '';
}

// Stel vraag
function askQuestion(questionIndex) {
    state.currentQuestion = questionIndex;
    showingMoreOptions = false;
    
    // Check of we klaar zijn
    if (questionIndex >= questions.length) {
        showSummary();
        return;
    }
    
    const question = questions[questionIndex];
    
    // Speciale behandeling voor materiaal vraag (Q4)
    if (question.id === 'materiaal') {
        handleMaterialQuestion();
        return;
    }
    
    // Toon vraag
    let questionText = question.text;
    if (question.type === 'buttons') {
        questionText += ' Kies wat het beste past, of typ je eigen antwoord.';
    }
    showBotMessage(questionText);
    
    // Toon knoppen of tekstveld
    if (question.type === 'buttons') {
        currentQuestionOptions = question.options;
        const hasMore = question.hasMoreOptions && question.options.length > 4;
        showButtons(question.options, hasMore);
    } else {
        clearButtons();
    }
    
    userInput.focus();
}

// Behandel materiaal vraag (Q4)
function handleMaterialQuestion() {
    // Als dit de eerste materiaal vraag is, bepaal hoeveel zijdes
    if (state.materialSides.current === 0) {
        const zijdesAnswer = state.answers.zijdes;
        let totalSides = 0;
        
        if (zijdesAnswer === '1 zijde') totalSides = 1;
        else if (zijdesAnswer === '2 zijdes') totalSides = 2;
        else if (zijdesAnswer === '3 zijdes') totalSides = 3;
        else if (zijdesAnswer === 'Alle zijdes') totalSides = 4;
        
        state.materialSides.total = totalSides;
        state.materialSides.current = 1;
    }
    
    // Vraag materiaal voor huidige zijde
    const question = questions[3];
    question.text = `Welk materiaal zit er op zijde ${state.materialSides.current}?`;
    
    showBotMessage(question.text + ' Kies wat het beste past, of typ je eigen antwoord.');
    showButtons(question.options);
    userInput.focus();
}

// Behandel knop klik
function handleButtonClick(answer) {
    if (answer === 'Anders') {
        showBotMessage('Geen probleem! Typ dan gewoon je eigen antwoord in het tekstveld hieronder.');
        clearButtons();
        userInput.focus();
        return;
    }
    
    processAnswer(answer);
}

// Behandel verzenden
function handleSend() {
    const answer = userInput.value.trim();
    if (answer === '') {
        return;
    }
    
    userInput.value = '';
    showUserMessage(answer);
    
    // Korte vertraging voor natuurlijke flow
    setTimeout(() => {
        processAnswer(answer);
    }, 300);
}

// Verwerk antwoord
function processAnswer(answer) {
    const question = questions[state.currentQuestion];
    
    // Check onderwerpsbeperking
    if (isOffTopic(answer)) {
        showBotMessage('Dat valt buiten mijn expertise, maar ik help u graag verder met vragen over warmtebehoud en glazen schuifwanden.');
        return;
    }
    
    // Empathische reactie
    showEmpatheticResponse(answer);
    
    // Sla antwoord op
    if (question.id === 'materiaal') {
        state.materialSides.materials[`zijde${state.materialSides.current}`] = answer;
        
        // Check of er meer zijdes zijn
        if (state.materialSides.current < state.materialSides.total) {
            state.materialSides.current++;
            setTimeout(() => {
                handleMaterialQuestion();
            }, 800);
        } else {
            // Alle materialen verzameld, sla op en ga verder
            state.answers.materiaal = state.materialSides.materials;
            state.materialSides.current = 0;
            setTimeout(() => {
                askQuestion(4); // Ga naar Q5 (index 4)
            }, 800);
        }
    } else {
        state.answers[question.id] = answer;
        
        // Ga naar volgende vraag
        setTimeout(() => {
            askQuestion(state.currentQuestion + 1);
        }, 800);
    }
}

// Empathische reactie
function showEmpatheticResponse(answer) {
    const responses = [
        'Goed om te weten!',
        'Duidelijk, dank je!',
        'Dat helpt me verder.',
        'Bedankt voor je antwoord!',
        'Prima!'
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    showBotMessage(randomResponse);
}

// Check of antwoord off-topic is
function isOffTopic(text) {
    const offTopicKeywords = [
        'prijs', 'kosten', 'offerte', 'prijslijst', 'hoeveel kost',
        'verkoop', 'kopen', 'bestellen', 'bestelling',
        'pakket', 'configuratie', 'combinatie',
        'installatie', 'montage', 'leverancier'
    ];
    
    const lowerText = text.toLowerCase();
    return offTopicKeywords.some(keyword => lowerText.includes(keyword));
}

// Toon samenvatting
function showSummary() {
    clearButtons();
    
    let summary = 'Bedankt voor alle antwoorden! Hier is een korte samenvatting:\n\n';
    
    // Woning
    if (state.answers.woning) {
        summary += `Je hebt een ${state.answers.woning.toLowerCase()}.\n`;
    }
    
    // Plaatsing
    if (state.answers.plaatsing) {
        summary += `Je wilt de schuifwand plaatsen: ${state.answers.plaatsing}.\n`;
    }
    
    // Zijdes
    if (state.answers.zijdes) {
        summary += `Er worden ${state.answers.zijdes} afgesloten.\n`;
    }
    
    // Materiaal
    if (state.answers.materiaal) {
        summary += 'Materiaal per zijde:\n';
        Object.keys(state.answers.materiaal).forEach(zijde => {
            summary += `- ${zijde}: ${state.answers.materiaal[zijde]}\n`;
        });
    }
    
    // Verwarming
    if (state.answers.verwarming) {
        summary += `Je verwarmt met: ${state.answers.verwarming}.\n`;
    }
    
    // Isolatie
    if (state.answers.isolatie) {
        summary += `Je huidige isolatie is: ${state.answers.isolatie.toLowerCase()}.\n`;
    }
    
    // Grootte
    if (state.answers.grootte) {
        summary += `De opening/ruimte is: ${state.answers.grootte}.\n`;
    }
    
    // Energiekosten
    if (state.answers.energiekosten) {
        summary += `Je maandelijkse energiekosten zijn ongeveer: ${state.answers.energiekosten}.\n`;
    }
    
    // Kamer
    if (state.answers.kamer) {
        summary += `Achter de schuifwand zit een ${state.answers.kamer.toLowerCase()}.\n`;
    }
    
    // Reden
    if (state.answers.reden) {
        summary += `Je wilt meer warmte behouden omdat: ${state.answers.reden.toLowerCase()}.\n`;
    }
    
    summary += '\nAls we straks de berekende resultaten hebben (warmtereductie, eurobesparing en terugverdientijd), leg ik je rustig uit wat dat betekent voor jouw situatie.';
    
    showBotMessage(summary);
}

// Start de app
init();

