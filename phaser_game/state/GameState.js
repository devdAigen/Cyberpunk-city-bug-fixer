// state/GameState.js
// Holds the salary/criticality economy and talks to the reqres.in "user_sessions" collection
// for progress persistence. Coding-question data is no longer used — incidents are now
// graphical mini-games (see minigames/), so only session progress needs the network.

const API_BASE = "https://reqres.in/api/collections";
const PROJECT_ID = "36666";
const API_KEY = "pro_be6119ea7db7801f21e17ec1a0a19972f528caed47432d357008becb9dec1b6f";
const HEADERS = { "Content-Type": "application/json", "x-api-key": API_KEY, "X-Reqres-Env": "dev" };

function apiUrl(collection, id) {
    return `${API_BASE}/${collection}/records${id ? "/" + id : ""}?project_id=${PROJECT_ID}`;
}

const REWARD_BY_SEVERITY = { LOW: 500, MEDIUM: 1000, HIGH: 2000 };
const BURST_PENALTY = 300;
const CRIT_INC = { stable: 15, warning: 20, critical: 25 };
const CRIT_DEC_ON_FIX = 5;

export default class GameState {

    constructor(scene) {
        this.scene = scene;
        this.sessionId = null;
        this.salary = 0;
        this.streak = 0;
        this.criticality = 0;
        this.stage = "stable";
        this.fixedCount = 0;
        this.failedCount = 0;
        this.onChange = null; // HUD hook, set by the scene
    }

    async init() {
        await this.createSession();
    }

    async createSession() {
        const payload = {
            data:{
            playerId: "dev-" + Math.random().toString(36).slice(2, 8),
            salary: 0, criticality: 0, stage: "stable",
            streak: 0, fixedCount: 0, failedCount: 0, status: "active",
            startedAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString(),
        }};
        try {
            const res = await fetch(apiUrl("user_sessions"), { method: "POST", headers: HEADERS, body: JSON.stringify(payload) });
            const data = await res.json();
            this.sessionId = data.id || data.data?.id || null;
        } catch (e) {
            console.warn("Session create failed, continuing in local-only mode.", e);
        }
    }

    async patchSession(partial) {
        if (!this.sessionId) return;
        partial.lastUpdatedAt = new Date().toISOString();
        try {
            await fetch(apiUrl("user_sessions", this.sessionId), { method: "PATCH", headers: HEADERS, body: JSON.stringify(partial) });
        } catch (e) {
            console.warn("Session patch failed (non-blocking).", e);
        }
    }

    onFixSuccess(task, severity) {
        const reward = REWARD_BY_SEVERITY[severity] || REWARD_BY_SEVERITY.LOW;
        const streakBonus = Math.floor(reward * Math.min(this.streak, 5) * 0.1);
        this.salary += reward + streakBonus;
        this.streak += 1;
        this.criticality = Math.max(0, this.criticality - CRIT_DEC_ON_FIX);
        this.fixedCount += 1;
        this.patchSession({
            salary: this.salary, streak: this.streak, criticality: this.criticality,
            stage: this.stage, fixedCount: this.fixedCount,
        });
        this.notify({ type: "fixed", amount: reward + streakBonus, task });
    }

    onFixFail(task, severity) {
        this.salary = Math.max(0, this.salary - BURST_PENALTY);
        this.streak = 0;
        this.criticality = Math.min(100, this.criticality + (CRIT_INC[this.stage] || 25));
        this.failedCount += 1;
        this.updateStage();
        this.patchSession({
            salary: this.salary, streak: 0, criticality: this.criticality,
            stage: this.stage, failedCount: this.failedCount,
        });
        this.notify({ type: "burst", amount: BURST_PENALTY, task });
        if (this.stage === "meltdown") this.notify({ type: "meltdown" });
    }

    updateStage() {
        const c = this.criticality;
        this.stage = c >= 90 ? "meltdown" : c >= 60 ? "critical" : c >= 30 ? "warning" : "stable";
    }

    notify(event) {
        if (this.onChange) this.onChange(event, this);
    }
}
