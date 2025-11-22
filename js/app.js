/**
 * grandSip - Softphone Web Application
 * Frontend Interface Controller
 */

// ===================================
// Application State
// ===================================
const AppState = {
    // Connection status: 'disconnected', 'connecting', 'connected'
    connectionStatus: 'disconnected',

    // Call status: 'idle', 'calling', 'ringing', 'in-call'
    callStatus: 'idle',

    // Current phone number being dialed
    currentNumber: '',

    // Call timer
    callStartTime: null,
    callTimerInterval: null,

    // Audio settings
    volume: 70,
    isMuted: false,
    isOnHold: false,

    // Call history
    callHistory: [
        {
            name: 'João Silva',
            number: '(11) 98765-4321',
            type: 'missed',
            time: '14:30',
            date: new Date()
        },
        {
            name: 'Maria Santos',
            number: '(21) 91234-5678',
            type: 'incoming',
            time: '12:15',
            date: new Date()
        },
        {
            name: 'Pedro Costa',
            number: '(11) 93456-7890',
            type: 'outgoing',
            time: '10:45',
            date: new Date()
        }
    ]
};

// ===================================
// DOM Elements
// ===================================
const DOMElements = {
    // Display elements
    contactName: document.getElementById('contactName'),
    phoneNumber: document.getElementById('phoneNumber'),
    callTimer: document.getElementById('callTimer'),
    callStatus: document.getElementById('callStatus'),
    callDisplay: document.querySelector('.call-display'),

    // Status
    connectionStatus: document.getElementById('connectionStatus'),

    // Buttons
    btnCall: document.getElementById('btnCall'),
    btnHangup: document.getElementById('btnHangup'),
    btnMute: document.getElementById('btnMute'),
    btnHold: document.getElementById('btnHold'),
    btnTransfer: document.getElementById('btnTransfer'),
    btnKeypad: document.getElementById('btnKeypad'),
    btnBackspace: document.getElementById('btnBackspace'),

    // Dialpad buttons
    dialpadButtons: document.querySelectorAll('.btn-dialpad'),

    // Volume
    volumeSlider: document.getElementById('volumeSlider'),

    // History
    historyList: document.getElementById('historyList')
};

// ===================================
// Display Functions
// ===================================

/**
 * Update the phone number display
 */
function updateDisplay() {
    if (AppState.currentNumber) {
        DOMElements.phoneNumber.textContent = AppState.currentNumber;
        DOMElements.contactName.textContent = '-';
    } else {
        DOMElements.phoneNumber.textContent = '';
        DOMElements.contactName.textContent = '-';
    }
}

/**
 * Update call status display
 */
function updateCallStatus(status) {
    AppState.callStatus = status;

    // Update status text
    const statusTexts = {
        'idle': 'Aguardando...',
        'calling': 'Chamando...',
        'ringing': 'Tocando...',
        'in-call': 'Em chamada'
    };

    DOMElements.callStatus.textContent = statusTexts[status] || 'Aguardando...';

    // Update display styling
    DOMElements.callDisplay.classList.remove('calling', 'in-call');
    if (status === 'calling' || status === 'ringing') {
        DOMElements.callDisplay.classList.add('calling');
    } else if (status === 'in-call') {
        DOMElements.callDisplay.classList.add('in-call');
    }

    // Update button states
    updateButtonStates();
}

/**
 * Update connection status display
 */
function updateConnectionStatus(status) {
    AppState.connectionStatus = status;

    const statusTexts = {
        'disconnected': 'Desconectado',
        'connecting': 'Conectando...',
        'connected': 'Conectado'
    };

    DOMElements.connectionStatus.querySelector('.status-text').textContent = statusTexts[status];
    DOMElements.connectionStatus.classList.remove('connected', 'connecting');

    if (status === 'connected') {
        DOMElements.connectionStatus.classList.add('connected');
    } else if (status === 'connecting') {
        DOMElements.connectionStatus.classList.add('connecting');
    }
}

/**
 * Update button enabled/disabled states
 */
function updateButtonStates() {
    const isInCall = AppState.callStatus === 'in-call' || AppState.callStatus === 'calling';

    DOMElements.btnCall.disabled = isInCall || !AppState.currentNumber;
    DOMElements.btnHangup.disabled = !isInCall;
    DOMElements.btnMute.disabled = !isInCall;
    DOMElements.btnHold.disabled = !isInCall;
    DOMElements.btnTransfer.disabled = !isInCall;
}

/**
 * Format time for call timer
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Start call timer
 */
function startCallTimer() {
    AppState.callStartTime = Date.now();

    AppState.callTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - AppState.callStartTime) / 1000);
        DOMElements.callTimer.textContent = formatTime(elapsed);
    }, 1000);
}

/**
 * Stop call timer
 */
function stopCallTimer() {
    if (AppState.callTimerInterval) {
        clearInterval(AppState.callTimerInterval);
        AppState.callTimerInterval = null;
    }
    DOMElements.callTimer.textContent = '00:00:00';
    AppState.callStartTime = null;
}

// ===================================
// Call Control Functions
// ===================================

/**
 * Initiate a call
 */
function makeCall() {
    if (!AppState.currentNumber) return;

    console.log('Making call to:', AppState.currentNumber);

    // Update UI
    updateCallStatus('calling');

    // Simulate call connection after 2 seconds
    setTimeout(() => {
        if (AppState.callStatus === 'calling') {
            updateCallStatus('in-call');
            startCallTimer();

            // Add to call history
            addToCallHistory({
                name: 'Desconhecido',
                number: AppState.currentNumber,
                type: 'outgoing',
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                date: new Date()
            });
        }
    }, 2000);
}

/**
 * End current call
 */
function hangupCall() {
    console.log('Hanging up call');

    // Update UI
    updateCallStatus('idle');
    stopCallTimer();

    // Reset mute and hold states
    if (AppState.isMuted) toggleMute();
    if (AppState.isOnHold) toggleHold();
}

/**
 * Toggle mute
 */
function toggleMute() {
    AppState.isMuted = !AppState.isMuted;

    DOMElements.btnMute.classList.toggle('active', AppState.isMuted);

    console.log('Mute:', AppState.isMuted ? 'ON' : 'OFF');
}

/**
 * Toggle hold
 */
function toggleHold() {
    AppState.isOnHold = !AppState.isOnHold;

    DOMElements.btnHold.classList.toggle('active', AppState.isOnHold);

    if (AppState.isOnHold) {
        updateCallStatus('idle');
        stopCallTimer();
    } else {
        updateCallStatus('in-call');
        startCallTimer();
    }

    console.log('Hold:', AppState.isOnHold ? 'ON' : 'OFF');
}

/**
 * Transfer call
 */
function transferCall() {
    console.log('Transfer call initiated');

    // In a real implementation, this would open a transfer dialog
    alert('Função de transferência será implementada');
}

// ===================================
// Dialpad Functions
// ===================================

/**
 * Add digit to current number
 */
function addDigit(digit) {
    if (AppState.callStatus === 'in-call') {
        // Send DTMF tone during call
        console.log('Sending DTMF:', digit);
        return;
    }

    AppState.currentNumber += digit;
    updateDisplay();
    updateButtonStates();
}

/**
 * Remove last digit
 */
function removeDigit() {
    AppState.currentNumber = AppState.currentNumber.slice(0, -1);
    updateDisplay();
    updateButtonStates();
}

/**
 * Clear all digits
 */
function clearDisplay() {
    AppState.currentNumber = '';
    updateDisplay();
    updateButtonStates();
}

// ===================================
// Call History Functions
// ===================================

/**
 * Add call to history
 */
function addToCallHistory(call) {
    AppState.callHistory.unshift(call);

    // Keep only last 10 calls
    if (AppState.callHistory.length > 10) {
        AppState.callHistory = AppState.callHistory.slice(0, 10);
    }

    renderCallHistory();
}

/**
 * Render call history
 */
function renderCallHistory() {
    DOMElements.historyList.innerHTML = '';

    AppState.callHistory.forEach(call => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => {
            AppState.currentNumber = call.number.replace(/\D/g, '');
            updateDisplay();
            updateButtonStates();
        };

        const iconSVG = `
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
            </svg>
        `;

        historyItem.innerHTML = `
            <div class="history-icon ${call.type}">
                ${iconSVG}
            </div>
            <div class="history-info">
                <div class="history-name">${call.name}</div>
                <div class="history-number">${call.number}</div>
            </div>
            <div class="history-time">${call.time}</div>
        `;

        DOMElements.historyList.appendChild(historyItem);
    });
}

// ===================================
// Event Listeners
// ===================================

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Dialpad buttons
    DOMElements.dialpadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const digit = button.getAttribute('data-digit');
            addDigit(digit);

            // Visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        });
    });

    // Control buttons
    DOMElements.btnCall.addEventListener('click', makeCall);
    DOMElements.btnHangup.addEventListener('click', hangupCall);
    DOMElements.btnMute.addEventListener('click', toggleMute);
    DOMElements.btnHold.addEventListener('click', toggleHold);
    DOMElements.btnTransfer.addEventListener('click', transferCall);
    DOMElements.btnBackspace.addEventListener('click', removeDigit);

    // Long press backspace to clear
    let backspaceTimer;
    DOMElements.btnBackspace.addEventListener('mousedown', () => {
        backspaceTimer = setTimeout(() => {
            clearDisplay();
        }, 1000);
    });
    DOMElements.btnBackspace.addEventListener('mouseup', () => {
        clearTimeout(backspaceTimer);
    });
    DOMElements.btnBackspace.addEventListener('mouseleave', () => {
        clearTimeout(backspaceTimer);
    });

    // Volume slider
    DOMElements.volumeSlider.addEventListener('input', (e) => {
        AppState.volume = parseInt(e.target.value);
        console.log('Volume set to:', AppState.volume);
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        // Number keys and special characters
        if (/^[0-9*#]$/.test(e.key)) {
            addDigit(e.key);
        }
        // Backspace
        else if (e.key === 'Backspace') {
            e.preventDefault();
            removeDigit();
        }
        // Enter to call
        else if (e.key === 'Enter' && AppState.currentNumber && AppState.callStatus === 'idle') {
            makeCall();
        }
        // Escape to hangup
        else if (e.key === 'Escape' && AppState.callStatus !== 'idle') {
            hangupCall();
        }
    });
}

// ===================================
// Connection Simulation
// ===================================

/**
 * Simulate connection to SIP server
 */
function simulateConnection() {
    updateConnectionStatus('connecting');

    // Simulate connection after 2 seconds
    setTimeout(() => {
        updateConnectionStatus('connected');
        console.log('Connected to SIP server (simulated)');
    }, 2000);
}

// ===================================
// Initialization
// ===================================

/**
 * Initialize the application
 */
function init() {
    console.log('grandSip - Initializing...');

    // Set initial state
    updateDisplay();
    updateCallStatus('idle');
    updateConnectionStatus('disconnected');
    updateButtonStates();
    renderCallHistory();

    // Initialize event listeners
    initEventListeners();

    // Simulate connection
    simulateConnection();

    console.log('grandSip - Ready!');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===================================
// Export for future SIP integration
// ===================================
window.grandSip = {
    AppState,
    makeCall,
    hangupCall,
    toggleMute,
    toggleHold,
    transferCall,
    addDigit,
    removeDigit,
    clearDisplay,
    updateConnectionStatus,
    updateCallStatus
};
