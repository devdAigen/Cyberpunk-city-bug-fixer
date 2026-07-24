import Player from "../entities/Player.js";
import EngineTask from "../tasks/EngineTask.js";
import NavigationTask from "../tasks/NavigationTask.js";
import ReactorTask from "../tasks/ReactorTask.js";
import LifeSupportTask from "../tasks/LifeSupportTask.js";
import CommsTask from "../tasks/CommsTask.js";
import IncidentWindow from "../Ui/IncidentWindow.js";
import SoundFX from "../Ui/SoundFX.js";
import Hud from "../Ui/Hud.js";
import GameState from "../state/GameState.js";

// Tiles from the dungeon tileset that are actually solid (confirmed by inspecting the sheet directly —
// see /assets/maps/tilesheet.png). Everything else on "Tile Layer 1" is floor/decoration and stays walkable.
const WALL_TILE_IDS = [4, 5, 17, 36, 45, 60];

const TASK_CLASSES = {
    Engine: EngineTask,
    Navigation: NavigationTask,
    Reactor: ReactorTask,
    LifeSupport: LifeSupportTask,
    Comms: CommsTask,
};

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }

    create() {

        const map = this.make.tilemap({ key: "ship" });
        const tileset = map.addTilesetImage("tilesheet", "tilesheet");

        // This sample map only exports a single tile layer ("Tile Layer 1") rather than separate
        // Ground/Object layers — so we render it and derive collision from a known wall tile set
        // instead of assuming layers that don't exist in this file.
       // const groundLayer = map.createLayer("Object", tileset, 0, 0);
       // groundLayer.setCollision(WALL_TILE_IDS);
     //   this.collisionLayer = groundLayer;

              const taskObject = map.getObjectLayer("taskObject2");


        map.createLayer("Ground", tileset, 120, 0);
        map.createLayer("Tile Layer 1", tileset, 0, 0);
       // map.createLayer("Object", tileset, 0, 0);
        const collisionLayer = map.createLayer("Object", tileset);
        collisionLayer.setCollisionByExclusion([-1]);
        // Debug overlay for the collision shapes — comment out once you're happy with the walls.
        // const debugGfx = this.add.graphics();
        // groundLayer.renderDebug(debugGfx, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(255, 77, 94, 60),
        // });

        this.player = new Player(this, 228, 416);
        this.physics.add.collider(this.player, collisionLayer);
       // this.physics.add.collider(this.player, groundLayer);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({ up: "W", down: "S", left: "A", right: "D" });
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.cameras.main.setBackgroundColor("#111318");
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // ---- Tasks (from the "taskObject" object layer added alongside this map) ----
        this.tasks = [];
        const taskObjectLayer = map.getObjectLayer("taskObject2");
        if (taskObjectLayer && taskObjectLayer.objects) {
            taskObjectLayer.objects.forEach(obj => {
                const TaskClass = TASK_CLASSES[obj.name];
                if (!TaskClass) return;
                const task = new TaskClass(this, obj);
                this.tasks.push(task);
                this.spawnTaskMarker(obj);
            });
        } else {
            console.warn('No "taskObject" layer found on this map — no tasks were loaded.');
        }

        // ---- UI + game state ----
        this.sfx = new SoundFX(this);
        console.log(this.sfx)
        this.incidentWindow = new IncidentWindow(this, this.sfx);
        console.log(this.incidentWindow)
        this.hud = new Hud(this);

        this.gameState = new GameState(this);
        this.gameState.onChange = (event) => this.handleStateChange(event);
        this.gameState.init().then(() => this.hud.update(this.gameState));

        this.hud.update(this.gameState);
    }

    spawnTaskMarker(obj) {
        const marker = this.add.circle(obj.x, obj.y, 10, 0xffb347, 0.9).setDepth(20);
        this.tweens.add({ targets: marker, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
        const label = this.add.text(obj.x, obj.y - 22, obj.name, {
            fontSize: "12px", color: "#ffb347", fontStyle: "bold",
        }).setOrigin(0.5).setDepth(20);
        obj._marker = marker;
        obj._label = label;
    }

    handleStateChange(event) {
        if (event.type === "fixed") {
            this.hud.toast(`Fixed! +₹${event.amount}`, true);
            if (event.task?.data?._marker) {
                event.task.data._marker.setFillStyle(0x3ddc97);
                this.tweens.killTweensOf(event.task.data._marker);
                event.task.data._marker.setAlpha(1);
            }
        } else if (event.type === "burst") {
            this.hud.toast(`Burst! -₹${event.amount} · Roasted`, false);
            this.cameras.main.shake(150, 0.004);
        } else if (event.type === "meltdown") {
            this.showMeltdown();
        }
        this.hud.update(this.gameState);
    }

    showMeltdown() {
        this.physics.pause();
        this.meltdownActive = true;
        this.incidentWindow.open({
            incidentId: 9999,
            title: "SYSTEM MELTDOWN",
            severity: "HIGH",
            timeLimit: 999999,
            onAbort: () => {},
            onTimeout: () => {},
        });
        this.incidentWindow.setStatus("OFFLINE", 0xff4d5e);
        const b = this.incidentWindow.getContentBounds();
        this.meltdownText = this.add.text(b.centerX, b.y + b.height / 2, "", {
            fontFamily: "monospace", fontSize: "16px", color: "#dce7f0", align: "center", wordWrap: { width: b.width },
        }).setOrigin(0.5).setDepth(2010).setScrollFactor(0);
        this.meltdownText.setText(
            `The station could not hold.\n\n` +
            `₹${this.gameState.salary.toLocaleString("en-IN")} earned · ${this.gameState.fixedCount} incidents resolved\n\n` +
            `Press R to restart`
        );
    }

    update() {

        if (this.meltdownActive) {
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) window.location.reload();
            return;
        }

        if (this.incidentWindow.isOpen) return; // pause world movement while a repair is in progress

        const speed = 200;
        this.player.setVelocity(0);

        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        if (left) this.player.setVelocityX(-speed);
        if (right) this.player.setVelocityX(speed);
        if (up) this.player.setVelocityY(-speed);
        if (down) this.player.setVelocityY(speed);
        this.player.body.velocity.normalize().scale(speed * (left || right || up || down ? 1 : 0));

        let nearbyTask = null;
        this.tasks.forEach(task => {
            if (task.completed) return;
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, task.data.x, task.data.y);
            if (distance < 60) nearbyTask = task;
        });

        if (nearbyTask && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            nearbyTask.start();
        }
    }
}
