import config from '../config.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.buffers = new Map();
    this.unavailableKeys = new Set();
    this.warnedKeys = new Set();

    // Background music variables
    this.musicAudio = null;
    this.musicSource = null;
    this.musicGain = null;
    this.musicPlaying = false;
    this.musicVolume = 0.35;
    this.isDucked = false;
    this.preDuckVolume = 0.35;

    // Handle visibility change
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) {
          if (this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        } else {
          if (this.ctx.state === 'suspended' && this.initialized) {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  /**
   * Initializes AudioContext synchronously on user gesture (iOS requirement)
   * and begins decoding audio files asynchronously in background.
   */
  init() {
    if (this.initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API is not supported in this browser.');
        return;
      }

      // Synchronous creation and resume on user click for iOS Safari
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Play silent buffer to fully unlock iOS audio engine
      try {
        const silentBuffer = this.ctx.createBuffer(1, 1, 22050);
        const silentSource = this.ctx.createBufferSource();
        silentSource.buffer = silentBuffer;
        silentSource.connect(this.ctx.destination);
        silentSource.start(0);
      } catch (e) {
        // Ignore silent buffer unlock failure
      }

      this.initialized = true;

      // Setup Background Music HTMLAudioElement stream
      this._setupBackgroundMusic();

      // Load all SFX buffers asynchronously
      this._loadAllSFX();
    } catch (err) {
      console.warn('Failed to initialize AudioManager:', err);
    }
  }

  _setupBackgroundMusic() {
    const musicUrl = config.audio && config.audio['background-music'];
    if (!musicUrl) return;

    try {
      this.musicAudio = new Audio();
      this.musicAudio.crossOrigin = 'anonymous';
      this.musicAudio.loop = true;
      this.musicAudio.src = musicUrl;

      // Connect HTMLAudioElement to Web Audio API GainNode
      this.musicSource = this.ctx.createMediaElementSource(this.musicAudio);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.musicSource.connect(this.musicGain);
      this.musicGain.connect(this.ctx.destination);
    } catch (err) {
      this._markUnavailable('background-music', err);
    }
  }

  async _loadAllSFX() {
    if (!config.audio) return;

    const entries = Object.entries(config.audio);
    for (const [key, url] of entries) {
      if (key === 'background-music') continue;
      this._loadSFX(key, url);
    }
  }

  async _loadSFX(key, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this._markUnavailable(key, `HTTP ${response.status}`);
        return;
      }

      // Verify content type is not html (Vite fallback for missing files)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        this._markUnavailable(key, 'Received HTML instead of audio (file missing)');
        return;
      }

      const arrayBuffer = await response.arrayBuffer();

      // Decode with Promise + callback fallback for safari
      const audioBuffer = await new Promise((resolve, reject) => {
        const res = this.ctx.decodeAudioData(arrayBuffer, resolve, reject);
        if (res && typeof res.then === 'function') {
          res.then(resolve).catch(reject);
        }
      });

      if (audioBuffer) {
        this.buffers.set(key, audioBuffer);
      } else {
        this._markUnavailable(key, 'Decoded buffer was empty');
      }
    } catch (err) {
      this._markUnavailable(key, err);
    }
  }

  _markUnavailable(key, reason) {
    this.unavailableKeys.add(key);
    if (!this.warnedKeys.has(key)) {
      this.warnedKeys.add(key);
      console.warn(`[AudioManager] Audio key "${key}" unavailable:`, reason);
    }
  }

  /**
   * Play a sound effect by key.
   */
  play(key, { volume = 1, loop = false } = {}) {
    if (!this.initialized || !this.ctx || this.unavailableKeys.has(key)) {
      return null;
    }

    const buffer = this.buffers.get(key);
    if (!buffer) {
      return null;
    }

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = !!loop;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      source.start(0);

      return {
        source,
        gainNode,
        stop: () => {
          try {
            source.stop();
          } catch (e) {}
        },
      };
    } catch (err) {
      this._markUnavailable(key, err);
      return null;
    }
  }

  /**
   * Play background music
   */
  playMusic() {
    if (!this.initialized || !this.musicAudio || this.unavailableKeys.has('background-music')) {
      return;
    }

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (!this.musicPlaying) {
        this.musicAudio.play().then(() => {
          this.musicPlaying = true;
        }).catch((err) => {
          this._markUnavailable('background-music', err);
        });
      }
    } catch (err) {
      this._markUnavailable('background-music', err);
    }
  }

  /**
   * Fade in background music over specified duration in seconds.
   */
  fadeIn(duration = 3, targetVolume = 0.35) {
    this.musicVolume = targetVolume;
    if (!this.initialized || !this.musicGain || this.unavailableKeys.has('background-music')) {
      return;
    }

    this.playMusic();

    try {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(targetVolume, now + duration);
    } catch (err) {
      // Ignore ramp error
    }
  }

  /**
   * Fade out background music over specified duration in seconds.
   */
  fadeOut(duration = 1.5) {
    if (!this.initialized || !this.musicGain || !this.musicPlaying) {
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(0.0001, now + duration);

      setTimeout(() => {
        if (this.musicGain && this.musicGain.gain.value <= 0.001) {
          this.stopMusic();
        }
      }, duration * 1000 + 50);
    } catch (err) {
      this.stopMusic();
    }
  }

  /**
   * Stop background music immediately
   */
  stopMusic() {
    if (this.musicAudio) {
      try {
        this.musicAudio.pause();
        this.musicAudio.currentTime = 0;
      } catch (e) {}
    }
    this.musicPlaying = false;
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  /**
   * Set music volume immediately
   */
  setMusicVolume(v) {
    this.musicVolume = v;
    if (!this.initialized || !this.musicGain) return;
    try {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(v, now);
    } catch (e) {}
  }

  /**
   * Duck music volume (e.g. during voice or heavy effect)
   */
  duck(targetVol = 0.1, duration = 0.5) {
    if (!this.initialized || !this.musicGain) return;
    if (!this.isDucked) {
      this.preDuckVolume = this.musicVolume;
      this.isDucked = true;
    }
    try {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(targetVol, now + duration);
    } catch (e) {}
  }

  /**
   * Unduck music volume back to pre-ducked level
   */
  unduck(duration = 0.5) {
    if (!this.initialized || !this.musicGain) return;
    const targetVol = this.isDucked ? this.preDuckVolume : this.musicVolume;
    this.isDucked = false;
    try {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(targetVol, now + duration);
    } catch (e) {}
  }
}

export const audioManager = new AudioManager();
export default audioManager;
