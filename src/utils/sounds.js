class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.3;
    
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.enabled = false;
    }
  }

  createTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCollectSound() {
    this.createTone(800, 0.1, 'sine');
    setTimeout(() => this.createTone(1000, 0.1, 'sine'), 50);
  }

  playMutationSound() {
    this.createTone(200, 0.2, 'sawtooth');
    setTimeout(() => this.createTone(400, 0.2, 'square'), 100);
  }

  playGameOverSound() {
    this.createTone(400, 0.3, 'sine');
    setTimeout(() => this.createTone(300, 0.3, 'sine'), 200);
    setTimeout(() => this.createTone(200, 0.5, 'sine'), 400);
  }

  playCountdownSound() {
    this.createTone(1000, 0.1, 'square');
  }

  playBounceSound() {
    this.createTone(600, 0.05, 'triangle');
  }

  playTeleportSound() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createTone(200 + i * 100, 0.05, 'sine');
      }, i * 20);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

export const soundManager = new SoundManager();
