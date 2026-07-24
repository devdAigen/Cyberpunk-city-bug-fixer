// Ui/Hud.js
export default class Hud {

    constructor(scene) {
        this.scene = scene;

        this.container = scene.add.container(0, 0).setDepth(900).setScrollFactor(0);

        this.bg = scene.add.rectangle(0, 0, scene.scale.width, 46, 0x101e2e, 0.9).setOrigin(0);

        this.salaryText = scene.add.text(16, 12, "₹0", { fontSize: "18px", color: "#3ddc97", fontStyle: "bold" });
        this.streakText = scene.add.text(150, 12, "Streak 0", { fontSize: "14px", color: "#ffb347" });

        this.stageText = scene.add.text(scene.scale.width - 16, 12, "STABLE", { fontSize: "14px", color: "#3ddc97", fontStyle: "bold" }).setOrigin(1, 0);

        this.meterBg = scene.add.rectangle(scene.scale.width - 166, 30, 150, 6, 0x1b2e42).setOrigin(0, 0.5).setStrokeStyle(1, 0x23405a);
        this.meterFill = scene.add.rectangle(scene.scale.width - 166, 30, 2, 6, 0xffb347).setOrigin(0, 0.5);

        this.container.add([this.bg, this.salaryText, this.streakText, this.stageText, this.meterBg, this.meterFill]);

        this.toastText = scene.add.text(scene.scale.width / 2, 60, "", {
            fontSize: "16px", fontStyle: "bold", color: "#3ddc97", backgroundColor: "#10203080", padding: { x: 12, y: 6 },
        }).setOrigin(0.5).setDepth(950).setScrollFactor(0).setAlpha(0);
    }

    update(state) {
        this.salaryText.setText(`₹${state.salary.toLocaleString("en-IN")}`);
        this.streakText.setText(`Streak ${state.streak}`);
        this.stageText.setText(state.stage.toUpperCase());
        const colors = { stable: "#3ddc97", warning: "#ffb347", critical: "#ff4d5e", meltdown: "#ff4d5e" };
        this.stageText.setColor(colors[state.stage]);
        this.meterFill.width = Math.max(2, 150 * (state.criticality / 100));
        this.meterFill.fillColor = state.criticality > 60 ? 0xff4d5e : state.criticality > 30 ? 0xffb347 : 0x3ddc97;
    }

    toast(msg, good) {
        this.toastText.setText(msg);
        this.toastText.setColor(good ? "#3ddc97" : "#ff4d5e");
        this.toastText.setAlpha(1);
        this.scene.tweens.add({ targets: this.toastText, alpha: 0, delay: 900, duration: 400 });
    }
}
