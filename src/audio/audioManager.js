import config from '../config.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.musicSource = null;
    this.buffers = {};
    this.warnedKeys = new Set();
    this.isInitialized = false;
    this.musicVolume = 0.35;
    this.currentDuckVolume = null;

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  async init() {
    if (this.isInitialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API is not supported in this browser.');
        return;
      }

      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;

      // Asynchronously fetch and decode all audio files in config
      if (config.audio) {
        Object.entries(config.audio).forEach(([key, path]) => {
          this.loadAudio(key, path);
        });
      }
    } catch (err) {
      console.warn('Failed to initialize AudioManager:', err);
    }
  }

  async loadAudio(key, path) {
    if (this.buffers[key]) return;

    try {
      const response = await fetch(path);
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok || contentType.includes('text/html')) {
        this.markKeyUnavailable(key, `File not found or returned HTML (${path})`);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      // Inspect if returned content is HTML string before decoding
      const textCheck = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer.slice(0, 50));
      if (textCheck.toLowerCase().includes('<!doctype') || textCheck.toLowerCase().includes('<html')) {
        this.markKeyUnavailable(key, `Returned HTML contents instead of audio (${path})`);
        return;
      }

      this.ctx.decodeAudioData(
        arrayBuffer,
        (decodedBuffer) => {
          this.buffers[key] = decodedBuffer;
        },
        (err) => {
          this.markKeyUnavailable(key, `Decoding failed for ${path}: ${err?.message || err}`);
        }
      );
    } catch (err) {
      this.markKeyUnavailable(key, `Fetch/Decode error for ${path}: ${err?.message || err}`);
    }
  }

  markKeyUnavailable(key, reason) {
    this.buffers[key] = null;
    if (!this.warnedKeys.has(key)) {
      this.warnedKeys.add(key);
      console.warn(`[AudioManager] Audio key "${key}" unavailable: ${reason}`);
    }
  }

  play(key, { volume = 1, loop = false } = {}) {
    if (!this.isInitialized || !this.ctx || !this.buffers[key]) {
      return null;
    }

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffers[key];
      source.loop = loop;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      source.start(0);
      return source;
    } catch (err) {
      console.warn(`[AudioManager] Error playing sound "${key}":`, err);
      return null;
    }
  }

  playMusic() {
    if (!this.isInitialized || !this.ctx) return;
    const key = 'background-music';
    if (!this.buffers[key]) return;

    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
    }

    try {
      this.musicSource = this.ctx.createBufferSource();
      this.musicSource.buffer = this.buffers[key];
      this.musicSource.loop = true;
      this.musicSource.connect(this.musicGain);
      this.musicSource.start(0);
    } catch (err) {
      console.warn('[AudioManager] Error starting background music:', err);
    }
  }

  stopMusic() {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {}
      this.musicSource = null;
    }
  }

  fadeIn(duration = 3, targetVolume = 0.35) {
    this.musicVolume = targetVolume;
    if (!this.isInitialized || !this.ctx || !this.musicGain) return;

    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0, now);
    this.musicGain.gain.linearRampToValueAtTime(targetVolume, now + duration);

    this.playMusic();
  }

  fadeOut(duration = 2) {
    if (!this.isInitialized || !this.ctx || !this.musicGain) return;

    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(0, now + duration);

    setTimeout(() => {
      this.stopMusic();
    }, duration * 1000);
  }

  setMusicVolume(v) {
    this.musicVolume = v;
    if (!this.isInitialized || !this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(v, now);
  }

  duck(targetVolume = 0.1, duration = 0.5) {
    if (!this.isInitialized || !this.ctx || !this.musicGain) return;
    this.currentDuckVolume = this.musicGain.gain.value;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(targetVolume, now + duration);
  }

  unduck(duration = 0.5) {
    if (!this.isInitialized || !this.ctx || !this.musicGain) return;
    const target = this.currentDuckVolume ?? this.musicVolume;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(target, now + duration);
    this.currentDuckVolume = null;
  }

  handleVisibilityChange() {
    if (!this.ctx || !this.isInitialized) return;
    if (document.hidden) {
      if (this.ctx.state === 'running') {
        this.ctx.suspend();
      }
    } else {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  }
}

export const audioManager = new AudioManager();
export default audioManager;
