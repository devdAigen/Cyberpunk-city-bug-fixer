import BootScene from "./BootScene.js";
import GameScene from "./GameScene.js";

const config = {

    type: Phaser.AUTO,

    parent: "game",

    width: 1280,
    height:1280,

    backgroundColor: "#111",

    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    },

    scene: [BootScene, GameScene]

};

new Phaser.Game(config);
