let audioContext;
let microphone;
let gainNode;

async function initAudio() {
    try {
        // Create audio context on user gesture
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created successfully');
        
        // Create gain node
        gainNode = audioContext.createGain();
        console.log('GainNode created successfully');

        // Get user media with more flexible constraints
        const constraints = {
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        };

        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Microphone access granted');

        // Create and connect nodes
        microphone = audioContext.createMediaStreamSource(stream);
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

document.getElementById('start').addEventListener('click', initAudio);

document.getElementById('stop').addEventListener('click', () => {
    try {
        if (microphone) {
            microphone.disconnect();
            gainNode.disconnect();
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
