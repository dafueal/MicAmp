let audioContext;
let microphone;
let gainNode;
let currentStream;

// Function to populate the device list
async function updateDeviceList() {
    const deviceSelect = document.getElementById('audioDevices');
    deviceSelect.innerHTML = ''; // Clear existing options
    
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        audioInputs.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Microphone ${deviceSelect.length + 1}`;
            deviceSelect.appendChild(option);
        });
        
        console.log('Audio devices updated:', audioInputs.length, 'devices found');
    } catch (error) {
        console.error('Error getting audio devices:', error);
        alert('Error getting audio devices. Please check your permissions.');
    }
}

// Initialize device list when permissions are granted
async function requestInitialPermissions() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        await updateDeviceList();
    } catch (error) {
        console.error('Error getting initial permissions:', error);
        alert('Please grant microphone permissions to see available devices.');
    }
}

async function initAudio() {
    try {
        // Stop any existing stream
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Create audio context on user gesture
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext created successfully');
        }
        
        // Create gain node if it doesn't exist
        if (!gainNode) {
            gainNode = audioContext.createGain();
            console.log('GainNode created successfully');
        }

        // Get selected device
        const deviceId = document.getElementById('audioDevices').value;
        
        // Get user media with selected device
        const constraints = {
            audio: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        };

        console.log('Requesting microphone access...');
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Microphone access granted');

        // Create and connect nodes
        if (microphone) {
            microphone.disconnect();
        }
        microphone = audioContext.createMediaStreamSource(currentStream);
        microphone.connect(gainNode);
        const gainSlider = document.getElementById('gain');
        gainNode.gain.setValueAtTime(gainSlider.value, audioContext.currentTime);
        gainNode.connect(audioContext.destination);

        // Update UI
        document.getElementById('stop').disabled = false;
        document.getElementById('start').disabled = true;
        
        console.log('Audio pipeline setup complete');
    } catch (error) {
        console.error('Error in audio setup:', error.name, error.message);
        alert(`Error: ${error.message}. Please make sure you have granted microphone permissions and have a microphone connected.`);
        document.getElementById('start').disabled = false;
    }
}

// Event Listeners
document.getElementById('start').addEventListener('click', initAudio);

document.getElementById('stop').addEventListener('click', () => {
    try {
        if (microphone) {
            microphone.disconnect();
            gainNode.disconnect();
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            console.log('Audio stopped');
        }
        document.getElementById('stop').disabled = true;
        document.getElementById('start').disabled = false;
    } catch (error) {
        console.error('Error stopping audio:', error);
    }
});

// Add gain control listener
const gainSlider = document.getElementById('gain');
const gainValue = document.getElementById('gain-value');

gainSlider.addEventListener('input', () => {
    const value = parseFloat(gainSlider.value);
    gainValue.textContent = value.toFixed(1);
    if (gainNode) {
        gainNode.gain.setValueAtTime(value, audioContext.currentTime);
    }
});

// Add refresh button listener
document.getElementById('refreshDevices').addEventListener('click', updateDeviceList);

// Initialize device list on page load
requestInitialPermissions();
