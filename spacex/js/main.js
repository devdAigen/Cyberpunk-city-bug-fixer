import BootScene from "./BootScene.js";
import GameScene from "./GameScene.js";

const config = {
    type: Phaser.AUTO,

    parent: "game",

    width: window.innerWidth,
    height: window.innerHeight,

    backgroundColor: "#111",

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    },

    scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
})
