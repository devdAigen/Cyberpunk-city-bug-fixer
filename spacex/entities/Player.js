export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {

        super(scene, x, y, null);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(32, 32);
        this.setDisplaySize(32, 32);

        // Temporary green square
        this.body.setSize(32, 32);

        const graphics = scene.add.graphics();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillRect(0, 0, 32, 32);

        const key = "player-temp";

        if (!scene.textures.exists(key)) {
            graphics.generateTexture(key, 32, 32);
        }

        graphics.destroy();

        this.setTexture(key);

        this.setCollideWorldBounds(true);
        
    }

}