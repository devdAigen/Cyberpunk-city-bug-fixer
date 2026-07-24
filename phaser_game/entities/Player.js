// entities/Player.js
// Simple Arcade Physics player. Texture is generated at runtime (a small bean/capsule shape)
// so we don't depend on a dedicated player sprite existing in the dungeon tileset.

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {

        Player.ensureTexture(scene);

        super(scene, x, y, "player");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDepth(50);
        this.body.setSize(28, 34);
        this.body.setOffset(2, 2);
    }

    static ensureTexture(scene) {

        if (scene.textures.exists("player")) return;

        const g = scene.add.graphics();

        // backpack
        g.fillStyle(0xc24f2c, 1);
        g.fillRoundedRect(24, 10, 8, 16, 3);

        // body
        g.fillStyle(0xe0663b, 1);
        g.fillRoundedRect(2, 2, 28, 34, 12);
        g.lineStyle(2, 0x7a2e14, 1);
        g.strokeRoundedRect(2, 2, 28, 34, 12);

        // visor
        g.fillStyle(0xbfefff, 1);
        g.fillRoundedRect(6, 10, 18, 9, 4);
        g.lineStyle(1, 0x16303f, 1);
        g.strokeRoundedRect(6, 10, 18, 9, 4);

        g.generateTexture("player", 32, 36);
        g.destroy();
    }
}
