// Ui/IncidentWindow.js
// The "SPACE FIX — SHIP OPERATING SYSTEM" frame that every repair incident opens inside.
// This owns only the chrome (border, header, timer, footer) — the actual mini-game
// renders into the content bounds this window reports back through onReady().

const SEVERITY_COLORS = {
    LOW: 0x3ddc97,
    MEDIUM: 0xffb347,
    HIGH: 0xff4d5e,
};

const PANEL_W = 640;
const PANEL_H = 560;

export default class IncidentWindow {

    constructor(scene, sfx) {
        this.scene = scene;
        this.sfx = sfx;
        this.isOpen = false;
        this._buildFrame();
    }

    _buildFrame() {
        const scene = this.scene;
        const w = scene.scale.width, h = scene.scale.height;
        this.cx = w / 2;
        this.cy = h / 2;
        this.left = this.cx - PANEL_W / 2;
        this.top = this.cy - PANEL_H / 2;

        this.root = scene.add.container(this.cx, this.cy).setDepth(2000).setScrollFactor(0).setAlpha(0).setScale(0.88);

        this.dimmer = scene.add.rectangle(0, 0, w, h, 0x030711, 0.72)
            .setOrigin(0.5).setPosition(this.cx - this.cx, this.cy - this.cy); // placeholder, repositioned below
        this.dimmer.setPosition(w / 2 - this.cx, h / 2 - this.cy);

        // Glow layers behind the panel — several stroked rounded rects, decreasing alpha outward,
        // gently pulsing to fake a soft sci-fi glow without a real blur filter.
        this.glowLayers = [];
        for (let i = 3; i >= 1; i--) {
            const pad = i * 6;
            const g = scene.add.rectangle(0, 0, PANEL_W + pad * 2, PANEL_H + pad * 2, 0x000000, 0)
                .setStrokeStyle(2, 0x4ecdc4, 0.10 * i);
            this.glowLayers.push(g);
        }

        this.panel = scene.add.rectangle(0, 0, PANEL_W, PANEL_H, 0x0b1622, 0.97).setStrokeStyle(2, 0x4ecdc4, 1);

        // Header bar
        this.headerDivider = scene.add.rectangle(0, -PANEL_H / 2 + 34, PANEL_W - 2, 1, 0x24455a);
        this.headerTitle = scene.add.text(-PANEL_W / 2 + 18, -PANEL_H / 2 + 10, "SPACE FIX — SHIP OPERATING SYSTEM", {
            fontFamily: "monospace", fontSize: "13px", color: "#4ecdc4", fontStyle: "bold",
        }).setOrigin(0, 0);

        this.statusDot = scene.add.circle(PANEL_W / 2 - 90, -PANEL_H / 2 + 18, 5, 0x3ddc97);
        this.statusText = scene.add.text(PANEL_W / 2 - 80, -PANEL_H / 2 + 10, "ACTIVE", {
            fontFamily: "monospace", fontSize: "12px", color: "#3ddc97", fontStyle: "bold",
        }).setOrigin(0, 0);

        this.timerText = scene.add.text(PANEL_W / 2 - 15, -PANEL_H / 2 + 40, "00:00", {
            fontFamily: "monospace", fontSize: "13px", color: "#dce7f0", fontStyle: "bold",
        }).setOrigin(1, 0);

        // Incident meta block
        this.incidentIdText = scene.add.text(-PANEL_W / 2 + 18, -PANEL_H / 2 + 46, "INCIDENT #0000", {
            fontFamily: "monospace", fontSize: "12px", color: "#7c93a8",
        }).setOrigin(0, 0);

        this.incidentTitleText = scene.add.text(-PANEL_W / 2 + 18, -PANEL_H / 2 + 66, "Untitled Incident", {
            fontFamily: "monospace", fontSize: "22px", color: "#ffffff", fontStyle: "bold",
        }).setOrigin(0, 0);

        this.severityText = scene.add.text(-PANEL_W / 2 + 500, -PANEL_H / 2 + 100, "Severity: LOW", {
            fontFamily: "monospace", fontSize: "13px", color: "#3ddc97", fontStyle: "bold",
        }).setOrigin(1, 0);

        // Footer
        this.footerDivider = scene.add.rectangle(0, PANEL_H / 2 - 34, PANEL_W - 2, 1, 0x24455a);
        this.footerText = scene.add.text(0, PANEL_H / 2 - 20, "Press ESC to abort", {
            fontFamily: "monospace", fontSize: "12px", color: "#5a7386",
        }).setOrigin(0.5, 0);

        this.root.add([
            ...this.glowLayers, this.panel,
            this.headerDivider, this.headerTitle, this.statusDot, this.statusText, this.timerText,
            this.incidentIdText, this.incidentTitleText, this.severityText,
            this.footerDivider, this.footerText,
        ]);
        this.dimmer.setDepth(1999).setScrollFactor(0).setAlpha(0);
    }

    // Content area in absolute screen space, for the mini-game to place its own objects into.
    getContentBounds() {
        return {
            x: this.left + 18,
            y: this.top + 118,
            width: PANEL_W - 36,
            height: PANEL_H - 118 - 46,
            centerX: this.cx,
        };
    }

    open({ incidentId, title, severity = "LOW", timeLimit = 40, onAbort, onTimeout }) {
        const scene = this.scene;
        this.onAbort = onAbort;
        this.onTimeout = onTimeout;
        this.timeLeft = timeLimit;

        this.incidentIdText.setText(`INCIDENT #${incidentId}`);
        this.incidentTitleText.setText(title);
        const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.LOW;
        this.severityText.setText(`Severity: ${severity}`);
        this.severityText.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
        this.setStatus("ACTIVE", 0x3ddc97);
        this._updateTimerText();

        this.isOpen = true;
        if (this.sfx) this.sfx.open();

        this.escHandler = () => this.abort();
        scene.input.keyboard.on("keydown-ESC", this.escHandler);

        scene.tweens.add({
            targets: this.dimmer, alpha: 1, duration: 200, ease: "Quad.easeOut",
        });
        scene.tweens.add({
            targets: this.root, alpha: 1, scale: 1, duration: 260, ease: "Back.easeOut",
        });

        this._pulseTween = scene.tweens.add({
            targets: this.glowLayers, alpha: { from: 0.5, to: 1 }, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
        });

        this.timerEvent = scene.time.addEvent({
            delay: 1000, loop: true,
            callback: () => {
                this.timeLeft -= 1;
                this._updateTimerText();
                if (this.sfx && this.timeLeft <= 10 && this.timeLeft > 0) this.sfx.tick();
                if (this.timeLeft <= 0) {
                    this.timerEvent.remove();
                    if (this.onTimeout) this.onTimeout();
                }
            },
        });

        // Return the content bounds synchronously — the open animation is purely cosmetic,
        // the mini-game can start laying out immediately underneath it.
        return this.getContentBounds();
    }

    setStatus(text, color) {
        this.statusText.setText(text);
        this.statusText.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
        this.statusDot.setFillStyle(color);
    }

    _updateTimerText() {
        const m = Math.max(0, Math.floor(this.timeLeft / 60)).toString().padStart(2, "0");
        const s = Math.max(0, this.timeLeft % 60).toString().padStart(2, "0");
        this.timerText.setText(`${m}:${s}`);
        this.timerText.setColor(this.timeLeft <= 10 ? "#ff4d5e" : "#dce7f0");
    }

    abort() {
        if (!this.isOpen) return;
        if (this.onAbort) this.onAbort();
        this.close();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        const scene = this.scene;

        if (this.timerEvent) { this.timerEvent.remove(); this.timerEvent = null; }
        if (this._pulseTween) { this._pulseTween.stop(); this._pulseTween = null; }
        if (this.escHandler) { scene.input.keyboard.off("keydown-ESC", this.escHandler); this.escHandler = null; }

        if (this.sfx) this.sfx.close();

        scene.tweens.add({ targets: this.dimmer, alpha: 0, duration: 180, ease: "Quad.easeIn" });
        scene.tweens.add({
            targets: this.root, alpha: 0, scale: 0.88, duration: 200, ease: "Quad.easeIn",
        });
    }

    destroy() {
        this.close();
        this.root.destroy();
        this.dimmer.destroy();
    }
}
