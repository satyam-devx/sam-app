// Naye Settings wale elements
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings');
const voiceSelect = document.getElementById('voice-select');
const wakeWordToggle = document.getElementById('wake-word-toggle');

let voices = [];
let isWakeWordMode = false;

// HTML Elements ko select kar rahe hain
const micBtn = document.getElementById('mic-btn');
const userText = document.getElementById('user-text');
const samText = document.getElementById('sam-text');
const statusText = document.getElementById('status');

// YAHAN APNI OPENWEATHER API KEY DAALO
const WEATHER_API_KEY = "2d98408c6a0e55bd438b2148fcb3dd7c"; 

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    samText.innerText = "Sorry, your browser doesn't support Voice Recognition.";
    statusText.innerText = "Error: Not Supported";
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US'; 

    recognition.onstart = () => {
        micBtn.classList.add('listening');
        statusText.innerText = "Listening...";
        userText.innerText = "Listening...";
    };

    recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        
        userText.innerText = transcript;
        
        // Agar Wake Word Mode ON hai
        if (isWakeWordMode) {
            if (transcript.includes('hey sam')) {
                // "Hey SAM" ke aage ki command nikalna
                let actualCommand = transcript.replace('hey sam', '').trim();
                statusText.innerText = "Processing Wake Word...";
                if(actualCommand !== "") {
                    processCommand(actualCommand);
                } else {
                    speak("Yes Divyanshu, I am listening.");
                }
            }
        } 
        // Agar Wake Word Mode OFF hai (Normal button click mode)
        else {
            statusText.innerText = "Processing...";
            processCommand(transcript);
        }
    };


    recognition.onend = () => {
    micBtn.classList.remove('listening');
    // Agar Wake Word ON hai, toh band hote hi dobara start kar do
    if (isWakeWordMode) {
        recognition.start();
    } else {
        statusText.innerText = "Tap the mic to speak";
    }
};

    micBtn.addEventListener('click', () => {
        recognition.start();
    });
}

// Updated SAM ke bolne ka function
function speak(text) {
    samText.innerText = text;
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    
    // Dropdown se jo voice select ki hai wo set karna
    const selectedVoiceIndex = voiceSelect.value;
    if (voices.length > 0 && selectedVoiceIndex !== "") {
        speech.voice = voices[selectedVoiceIndex];
    }
    
    window.speechSynthesis.speak(speech);
}


// Live Weather Fetch Karne Ka Function
async function getWeather(city) {
    try {
        // Metric units se temperature Celsius mein aayega
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            const temp = Math.round(data.main.temp);
            const condition = data.weather[0].description;
            speak(`The current temperature in ${city} is ${temp} degrees Celsius with ${condition}.`);
        } else {
            speak(`Sorry Divyanshu Hero, I couldn't find the weather details for ${city}.`);
        }
    } catch (error) {
        speak("I am having some trouble connecting to the weather servers right now.");
    }
}

// Live Joke Fetch Karne Ka Function (Safe Jokes Only)
async function getJoke() {
    try {
        // Hum ek free joke API use kar rahe hain
        const url = 'https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.joke) {
            speak(data.joke);
        } else {
            speak("I forgot the punchline! Let's try again later.");
        }
    } catch (error) {
        speak("My joke book is offline right now.");
    }
}

// Maths Calculation Ka Function
function calculateMath(command) {
    try {
        // Faltu words hata kar sirf numbers aur operators nikalna
        let expression = command.replace('calculate', '').replace('what is', '').trim();
        
        // Bolne wale words ko math symbols mein badalna
        expression = expression.replace(/plus/g, '+')
                               .replace(/minus/g, '-')
                               .replace(/multiplied by/g, '*')
                               .replace(/multiply/g, '*')
                               .replace(/into/g, '*')
                               .replace(/x/g, '*')
                               .replace(/divided by/g, '/')
                               .replace(/divide/g, '/');

        // eval() function string wale math ko solve kar deta hai
        const result = eval(expression);
        
        if (result !== undefined && !isNaN(result)) {
            speak(`The answer is ${result}`);
        } else {
            speak("I didn't quite catch the numbers. Please say it clearly.");
        }
    } catch (error) {
        speak("Sorry, my math chip malfunctioned. Try asking like: what is 5 plus 5.");
    }
}

// Memory Functions (To-Do List Local Storage)
function addToList(task) {
    // Pehle check karenge ki purani list me kuch hai ya nahi
    let list = JSON.parse(localStorage.getItem('sam_todo')) || [];
    list.push(task); // Naya task list me daal diya
    localStorage.setItem('sam_todo', JSON.stringify(list)); // Wapas save kar diya
    
    speak(`Got it. I have added ${task} to your list.`);
}

function readList() {
    let list = JSON.parse(localStorage.getItem('sam_todo')) || [];
    
    if (list.length === 0) {
        speak("Your to-do list is currently empty. You are all caught up!");
    } else {
        let tasks = list.join(", ");
        speak(`Here is your list: ${tasks}.`);
    }
}

function clearList() {
    localStorage.removeItem('sam_todo');
    speak("Your to-do list has been cleared completely.");
}

// System ki voices fetch karna
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}
window.speechSynthesis.onvoiceschanged = loadVoices;


// Commands Process Karne ka Logic (SAM ka Dimaag 2.0)
function processCommand(command) {
    let response = "";
    let shouldSpeak = true; // API calls ke liye flag

    // Greetings & Identity
    if (command.includes('hello') || command.includes('hi sam')) {
        response = "Hello Divyanshu Hero! How can I help you today?";
    } 
    else if (command.includes('how are you')) {
        response = "I am just a bunch of code, but I'm feeling fully charged! What about you?";
    }
    else if (command.includes('what is your name')) {
        response = "My name is SAM, your personal voice assistant.";
    }
    else if (command.includes('who created you') || command.includes('who made you')) {
        response = "I was created by the brilliant developer, Divyanshu Hero.";
    }
    
    // Time and Date
    else if (command.includes('time')) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        response = `The current time is ${time}.`;
    }
    else if (command.includes('date')) {
        const date = new Date().toLocaleDateString();
        response = `Today's date is ${date}.`;
    }
    
    // Open Websites
    else if (command.includes('open youtube')) {
        response = "Opening YouTube right away.";
        window.open("https://www.youtube.com", "_blank");
    }
    else if (command.includes('open google')) {
        response = "Opening Google for you.";
        window.open("https://www.google.com", "_blank");
    }

    // WEATHER API COMMAND
    else if (command.includes('weather')) {
        let city = "Madhubani"; // Default fallback
        
        // Agar user bole "weather in Mumbai", toh 'Mumbai' nikal lenge
        if (command.includes('in ')) {
            city = command.split('in ')[1].trim();
        }
        
        speak(`Let me check the live weather for ${city}...`);
        getWeather(city); // API call
        shouldSpeak = false; // Kyunki getWeather khud final response bolega
    }

    // JOKE API COMMAND
    else if (command.includes('joke')) {
        speak("Let me think of a good one...");
        getJoke();
        shouldSpeak = false; // API khud bolega
    }

    // MATHS CALCULATION COMMAND
    else if (command.includes('calculate') || (command.includes('what is') && /\d/.test(command))) {
        // \d check karta hai ki command mein koi number (digit) hai ya nahi
        calculateMath(command);
        shouldSpeak = false; // Function khud answer bolega
    }

    // TO-DO LIST COMMANDS
    else if (command.includes('add') && command.includes('to my list')) {
        // Faltu words hata kar sirf main task nikalna
        let task = command.replace('add', '').replace('to my list', '').trim();
        if (task !== "") {
            addToList(task);
            shouldSpeak = false; // Function khud bolega
        } else {
            response = "What do you want me to add? Please say the task clearly.";
        }
    }
    else if (command.includes('what is on my list') || command.includes('read my list') || command.includes('show my list')) {
        readList();
        shouldSpeak = false;
    }
    else if (command.includes('clear my list') || command.includes('delete my list')) {
        clearList();
        shouldSpeak = false;
    }


    // Fallback
    else {
        response = "I am not sure about that yet, but I am still learning!";
    }

    // Agar normally kuch bolna hai
    if (shouldSpeak && response !== "") {
        speak(response);
    }
}

window.onload = () => {
    setTimeout(() => {
        speak("System online. Ready for your commands.");
    }, 1000);
};

// Settings Panel Open/Close logic
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('hidden');
});
closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
});

// Wake Word Toggle logic
wakeWordToggle.addEventListener('change', (e) => {
    isWakeWordMode = e.target.checked;
    if (isWakeWordMode) {
        statusText.innerText = "Wake Word Active. Say 'Hey SAM'...";
        recognition.start(); // Mic continuously chalu ho jayega
    } else {
        statusText.innerText = "Tap the mic to speak";
        recognition.stop();
    }
});

