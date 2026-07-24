export default class BootScene extends Phaser.Scene {

    constructor() {
        super("BootScene");
    }

    preload() {

        this.load.image(
            "tilesheet",
            "assets/maps/tilesheet.png"
        );

        this.load.tilemapTiledJSON(
            "ship",
            "assets/maps/sample1.json"
        );
    }

    create() {
        this.scene.start("GameScene");
    }

}
