let audioContext;
let microphone;
let gainNode;

document.getElementById('start').addEventListener('click', async () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: "bluetooth" } } });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(gainNode);
        gainNode.gain.setValueAtTime(2, audioContext.currentTime); // Set amplification factor
        gainNode.connect(audioContext.destination);
        document.getElementById('stop').disabled = false;
        document.getElementById('start').disabled = true;
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
});

document.getElementById('stop').addEventListener('click', () => {
    if (microphone) {
        microphone.disconnect();
        gainNode.disconnect();
    }
    document.getElementById('stop').disabled = true;
    document.getElementById('start').disabled = false;
});
