// tasks/Task.js
// Base class for all station repair tasks. Each task now opens the ship's
// "incident window" (see Ui/IncidentWindow.js) and runs a graphical mini-game inside it
// (see minigames/) instead of a programming multiple-choice question — no coding
// knowledge required to play.
import MemoryLeakGame from "../minigames/MemoryLeakGame.js";

let incidentCounter = 1000;

const SEVERITY_CONFIG = {
    LOW: { timeLimit: 45, startRam: 10, ramPerBlock: 10, spawnIntervalMs: 3400, maxBlocks: 30 },
    MEDIUM: { timeLimit: 35, startRam: 10, ramPerBlock: 8, spawnIntervalMs: 2400, maxBlocks: 40 },
    HIGH: { timeLimit: 26, startRam: 15, ramPerBlock: 7, spawnIntervalMs: 1700, maxBlocks: 50 },
};

export default class Task {

    // severity drives both salary tier and mini-game difficulty; title is what shows
    // in the incident window header (e.g. "Memory Leak", "Power Surge").
    constructor(scene, data, severity = "LOW", title = "System Fault", MinigameClass = MemoryLeakGame) {
        this.scene = scene;
        this.data = data;
        this.severity = severity;
        this.title = title;
        this.MinigameClass = MinigameClass;
        this.completed = false;
        this.active = false;
    }

    start() {
        if (this.completed || this.active) return;
        this.active = true;
        incidentCounter += 1;
        this.incidentId = incidentCounter;

        const scene = this.scene;
        const bounds = scene.incidentWindow.open({
            incidentId: this.incidentId,
            title: this.title,
            severity: this.severity,
            timeLimit: SEVERITY_CONFIG[this.severity].timeLimit,
            onAbort: () => this.onAbort(),
            onTimeout: () => this.onTimeout(),
        });debugger;
        this.minigame = new this.MinigameClass(scene, bounds, SEVERITY_CONFIG[this.severity], scene.sfx);
        this.minigame.start(
            () => this.onWin(),
            () => this.onFail(),
        );
    }

    onWin() {
        this.active = false;
        this.completed = true;
        this._teardown();
        this.scene.incidentWindow.setStatus("RESOLVED", 0x3ddc97);
        this.scene.incidentWindow.close();
        this.scene.gameState.onFixSuccess(this, this.severity);
    }

    onFail() {
        this.active = false;
        this._teardown();
        this.scene.incidentWindow.setStatus("FAILED", 0xff4d5e);
        this.scene.incidentWindow.close();
        this.scene.gameState.onFixFail(this, this.severity);
    }

    onTimeout() {
        if (this.minigame) this.minigame.forceFail();
        else this.onFail();
    }

    onAbort() {
        // Aborting is a deliberate cancel, not a failed attempt — no salary/criticality penalty.
        // The leak stays unresolved and can be retried.
        this.active = false;
        this._teardown();
    }

    _teardown() {
        if (this.minigame) { this.minigame.destroy(); this.minigame = null; }
    }
}
