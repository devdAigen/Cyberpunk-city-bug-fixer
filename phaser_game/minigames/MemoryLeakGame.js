// minigames/MemoryLeakGame.js
// First graphical, non-technical incident mini-game: memory blocks pile up, the player
// drags them into the recycle bin to free RAM before the timer or the RAM bar maxes out.
// Every future minigame (CpuScheduler, CircuitPuzzle, DatabaseRepair, ...) should follow
// this same shape: constructor(scene, bounds, config) -> start(onWin, onFail) -> destroy().

const WIN_THRESHOLD = 20;   // % RAM usage to succeed
const FAIL_THRESHOLD = 100; // % RAM usage that bursts the pipe

export default class MemoryLeakGame {

    constructor(scene, bounds, config, sfx) {
        this.scene = scene;
        this.bounds = bounds;
        this.sfx = sfx;
        this.config = Object.assign({
            startRam: 10,
            ramPerBlock: 10,
            spawnIntervalMs: 2600,
            maxBlocks: 10,
        }, config);

        this.ram = this.config.startRam;
        this.blocks = [];
        this.objects = [];
        this.slots = this._buildSlots();
        this.finished = false;
    }

    _buildSlots() {
        // A fixed grid of candidate spawn points inside the play area, so blocks scatter
        // like the mockup without ever overlapping each other or the recycle bin.
        const { x, y, width, height } = this.bounds;
        const cols = 4, rows = 3;
        const slots = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                slots.push({
                    x: x + (c + 0.5) * (width / cols),
                    y: y + 34 + (r + 0.5) * ((height - 90) / rows),
                    taken: false,
                });
            }
        }
        console.log(slots);
        return slots;
    }

    start(onWin, onFail) {
        this.onWin = onWin;
        this.onFail = onFail;
        const scene = this.scene;
        const { x, y, width, height } = this.bounds;

        // --- RAM header ---
        this.label = scene.add.text(x, y - 6, "RAM Usage", {
            fontFamily: "monospace", fontSize: "14px", color: "#dce7f0", fontStyle: "bold",
        }).setOrigin(0, 1).setDepth(2010).setScrollFactor(0);

        this.pctText = scene.add.text(x + width, y - 6, "", {
            fontFamily: "monospace", fontSize: "14px", fontStyle: "bold",
        }).setOrigin(1, 1).setDepth(2010).setScrollFactor(0);

        console.log("pctText "+this.pctText);
        this.barBg = scene.add.rectangle(x, y + 8, width, 16, 0x0f1e30).setOrigin(0, 0).setStrokeStyle(1, 0x22364c).setDepth(2010).setScrollFactor(0);
        this.barFill = scene.add.rectangle(x + 1, y + 9, 1, 14, 0x3ddc97).setOrigin(0, 0).setDepth(2011).setScrollFactor(0);

        // --- Play area border (dashed sci-fi console look) ---
        this.playBorder = scene.add.rectangle(x, y + 44, width, height*2 - 60, 0x0a1420, 0.4)
            .setOrigin(0, 0).setStrokeStyle(1, 0x22364c).setDepth(2005).setScrollFactor(0);

        // --- Recycle bin drop zone ---
        const binX = x + width / 2, binY = y + height - 26;
        this.binIcon = scene.add.text(binX, binY, "🗑️", { fontSize: "34px" }).setOrigin(0.5).setDepth(2010).setScrollFactor(0);
        this.binGlow = scene.add.circle(binX, binY, 30, 0x4ecdc4, 0.08).setDepth(2005).setScrollFactor(0);
        this.dropZone = scene.add.zone(binX, binY, 70, 70).setRectangleDropZone(70, 70).setDepth(2005);
        this.dropZone.setScrollFactor(0);

        this.objects.push(this.label, this.pctText, this.barBg, this.barFill, this.playBorder, this.binIcon, this.binGlow, this.dropZone);
console.log(this.objects)
        this._updateRamVisual();

        // spawn a starter handful of blocks proportional to startRam
        const initialBlocks = Math.max(1, Math.round((this.config.startRam / 100) * this.config.maxBlocks));
        console.log("initialBlocks "+initialBlocks)
        for (let i = 0; i < initialBlocks; i++) this._spawnBlock();

        this.spawnEvent = scene.time.addEvent({
            delay: this.config.spawnIntervalMs, loop: true,
            callback: () => this._spawnBlock(),
        });

        scene.input.on("drop", this._onDrop, this);
        scene.input.on("dragstart", this._onDragStart, this);
        scene.input.on("drag", this._onDrag, this);
        scene.input.on("dragend", this._onDragEnd, this);
    }

    _freeSlot() {
        const free = this.slots.filter(s => !s.taken);
        if (free.length === 0) return null;
        console.log("free "+free)
        return free[Math.floor(Math.random() * free.length)];
    }

    _spawnBlock() {
        if (this.finished) return;
        const slot = this._freeSlot();
        console.log(slot);
        if (!slot) return; // grid full — RAM pressure still rises below

        slot.taken = true;
          console.log("Before ram "+this.ram,this.config.ramPerBlock)
        this.ram = Math.min(FAIL_THRESHOLD, this.ram + this.config.ramPerBlock);
        console.log("ram "+this.ram)
        const scene = this.scene;
        console.log(scene)
        const block = scene.add.text(slot.x, slot.y, "Task", { fontSize: "38px", })
            .setOrigin(0.5).setDepth(2015).setScrollFactor(0).setInteractive({ useHandCursor: true, draggable: true });
        block._slot = slot;
        block._origX = slot.x;
        block._origY = slot.y;

        scene.input.setDraggable(block);

        block.setScale(0.4).setAlpha(0);
        scene.tweens.add({ targets: block, scale: 1, alpha: 1, duration: 220, ease: "Back.easeOut" });

        this.blocks.push(block);
        this.objects.push(block);

        this._updateRamVisual();
        this._checkFail();
    }

    _onDragStart(pointer, gameObject) {
        if (!this.blocks.includes(gameObject) || this.finished) return;
        gameObject.setScale(1.15);
        gameObject.setDepth(2020);
        if (this.sfx) this.sfx.pickup();
    }

    _onDrag(pointer, gameObject, dragX, dragY) {
        if (!this.blocks.includes(gameObject) || this.finished) return;
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    _onDrop(pointer, gameObject, dropZone) {
        if (!this.blocks.includes(gameObject) || this.finished) return;
        if (dropZone !== this.dropZone) return;
        this._consumeBlock(gameObject);
    }

    _onDragEnd(pointer, gameObject, dropped) {
        if (!this.blocks.includes(gameObject) || this.finished) return;
        if (dropped) return; // handled by _onDrop
        // snapped back — didn't land in the bin
        const scene = this.scene;
        scene.tweens.add({
            targets: gameObject, x: gameObject._origX, y: gameObject._origY, scale: 1, duration: 180, ease: "Back.easeOut",
        });
    }

    _consumeBlock(block) {
        const scene = this.scene;
        block._slot.taken = false;
        this.blocks = this.blocks.filter(b => b !== block);
        this.objects = this.objects.filter(o => o !== block);

        this.ram = Math.max(0, this.ram - this.config.ramPerBlock);
        console.log(this.ram);
        if (this.sfx) this.sfx.drop();

        this.binGlow.setFillStyle(0x3ddc97, 0.3);
        scene.tweens.add({ targets: this.binGlow, alpha: 0.08, duration: 300 });

        scene.tweens.add({
            targets: block, x: this.binIcon.x, y: this.binIcon.y, scale: 0, alpha: 0, duration: 180, ease: "Quad.easeIn",
            onComplete: () => block.destroy(),
        });

        this._updateRamVisual();
        this._checkWin();
    }

    _updateRamVisual() {
        const pct = Math.round(this.ram);
        console.log(pct);
        
        this.pctText.setText(`${pct}%`);
        const color = pct >= 80 ? 0xff4d5e : pct >= 50 ? 0xffb347 : 0x3ddc97;
        this.pctText.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
        this.barFill.setFillStyle(color);
        const fullWidth = this.barBg.width - 2;
        this.barFill.width = Math.max(1, fullWidth * (pct / 100));
    }

    _checkWin() {
        console.log(this.ram,WIN_THRESHOLD)
        if (this.finished) return;
        if (this.ram < WIN_THRESHOLD) {
            this.finished = true;
            console.log(this.sfx)
            if (this.sfx) this.sfx.success();
            this.scene.time.delayedCall(500, () => this.onWin && this.onWin());
        }
    }

    _checkFail() {
        if (this.finished) return;
        if (this.ram >= FAIL_THRESHOLD) {
            this.finished = true;
            if (this.sfx) this.sfx.fail();
            this.scene.time.delayedCall(500, () => this.onFail && this.onFail());
        }
    }

    // Called externally when the overall incident timer runs out.
    forceFail() {
        if (this.finished) return;
        this.finished = true;
        if (this.sfx) this.sfx.fail();
        if (this.onFail) this.onFail();
    }

    destroy() {
        const scene = this.scene;
        scene.input.off("drop", this._onDrop, this);
        scene.input.off("dragstart", this._onDragStart, this);
        scene.input.off("drag", this._onDrag, this);
        scene.input.off("dragend", this._onDragEnd, this);
        if (this.spawnEvent) this.spawnEvent.remove();
        this.objects.forEach(o => o && o.destroy());
        this.objects = [];
        this.blocks = [];
    }
}
