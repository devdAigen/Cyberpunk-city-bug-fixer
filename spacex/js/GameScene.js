import Player from "../entities/Player.js";
// import Phaser from "phaser";


export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }


    

    create() {

        const map = this.make.tilemap({
            key: "ship"
        });
        const tileset = map.addTilesetImage(
            "tilesheet",
            "tilesheet"
        );

        console.log("Tileset:", tileset);

        map.createLayer("Ground", tileset, 0, 0);
            const collisionLayer = map.createLayer("Object", tileset);
        map.createLayer("Tile Layer 1", tileset, 0, 0);
       // map.createLayer("Object", tileset, 0, 0);
        this.player = new Player(this, 300, 300);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.setBackgroundColor("#333333");
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2);

        // const collisionLayer = map.createLayer("Collision", tileset);

        collisionLayer.setCollisionByExclusion([-1]);
        collisionLayer.renderDebug(this.add.graphics(), {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 120)
        });

        this.physics.add.collider(this.player, collisionLayer);
    }

    update() {

        const speed = 200;

        this.player.setVelocity(0);

        if (this.cursors.left.isDown)
            this.player.setVelocityX(-speed);

        if (this.cursors.right.isDown)
            this.player.setVelocityX(speed);

        if (this.cursors.up.isDown)
            this.player.setVelocityY(-speed);

        if (this.cursors.down.isDown)
            this.player.setVelocityY(speed);

    }
}