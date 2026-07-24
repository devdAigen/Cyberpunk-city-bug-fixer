// Ui/SoundFX.js
// Tiny WebAudio beep generator for terminal/sci-fi sound effects — no audio files to load,
// so this works immediately in the same single-project build. Browsers block audio until
// a user gesture, so the context is resumed on first pointerdown.

export default class SoundFX {

    constructor(scene) {
        this.scene = scene;
        this.ctx = null;
        this._armResume(scene);
    }

    _armResume(scene) {
        const resume = () => {
            if (!this.ctx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (AC) this.ctx = new AC();
            }
            if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
        };
        scene.input.once("pointerdown", resume);
        resume();
    }

    _tone(freq, duration, { type = "square", gain = 0.05, glideTo = null } = {}) {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + duration);
        amp.gain.setValueAtTime(gain, ctx.currentTime);
        amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(amp).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration + 0.02);
    }

    open() { this._tone(520, 0.12, { glideTo: 880 }); }
    close() { this._tone(420, 0.12, { glideTo: 180 }); }
    click() { this._tone(700, 0.05, { gain: 0.04 }); }
    pickup() { this._tone(900, 0.05, { gain: 0.04 }); }
    drop() { this._tone(300, 0.08, { glideTo: 120, gain: 0.06 }); }
    tick() { this._tone(1000, 0.04, { gain: 0.025 }); }
    success() {
        if (!this.ctx) return;
        this._tone(660, 0.09, { gain: 0.05 });
        setTimeout(() => this._tone(990, 0.14, { gain: 0.05 }), 90);
    }
    fail() {
        if (!this.ctx) return;
        this._tone(220, 0.18, { glideTo: 90, gain: 0.07, type: "sawtooth" });
    }
}
