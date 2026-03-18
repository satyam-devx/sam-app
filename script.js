// HTML Elements ko select kar rahe hain
const micBtn = document.getElementById('mic-btn');
const userText = document.getElementById('user-text');
const samText = document.getElementById('sam-text');
const statusText = document.getElementById('status');

// Speech Recognition Setup (Browser compatibility ke liye)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    samText.innerText = "Sorry, your browser doesn't support Voice Recognition.";
    statusText.innerText = "Error: Not Supported";
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Ek baar bolne par ruk jayega
    recognition.lang = 'en-US'; // Language English set hai, 'hi-IN' bhi kar sakte ho

    // Jab Mic chalu hoga
    recognition.onstart = () => {
        micBtn.classList.add('listening'); // CSS wala pulse animation start
        statusText.innerText = "Listening...";
        userText.innerText = "Listening...";
    };

    // Jab tum bolna band karoge aur result aayega
    recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        
        userText.innerText = transcript;
        statusText.innerText = "Processing...";
        
        // Command ko process karne bhejna
        processCommand(transcript);
    };

    // Jab recognition apne aap band ho
    recognition.onend = () => {
        micBtn.classList.remove('listening');
        statusText.innerText = "Tap the mic to speak";
    };

    // Mic button click event
    micBtn.addEventListener('click', () => {
        recognition.start();
    });
}

// SAM ke bolne ka function (Text to Speech)
function speak(text) {
    samText.innerText = text;
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1; // Bolne ki speed
    speech.pitch = 1; // Aawaz ka bhari-pan
    
    // Default system voice use karega
    window.speechSynthesis.speak(speech);
}

// Commands Process Karne ka Logic (SAM ka Dimaag)
function processCommand(command) {
    let response = "";

    // Greetings
    if (command.includes('hello') || command.includes('hi sam')) {
        response = "Hello Divyanshu Hero! How can I help you today?";
    } 
    else if (command.includes('how are you')) {
        response = "I am just a bunch of code, but I'm feeling fully charged! What about you?";
    }
    // Identity
    else if (command.includes('what is your name')) {
        response = "My name is SAM, your personal voice assistant.";
    }
    else if (command.includes('who created you') || command.includes('who made you')) {
        response = "I was created by the one and only, Divyanshu Hero.";
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
    // Fallback (Agar command samajh na aaye)
    else {
        response = "I am not sure about that yet, but I am still learning!";
    }

    // SAM ko jawab bolne ko kaho
    speak(response);
}

// Page load hone par ek initial greeting
window.onload = () => {
    setTimeout(() => {
        speak("System online. Ready for your commands.");
    }, 1000);
};
