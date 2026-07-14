import BaseMiniGame from "./BaseMiniGame.js";
import GameScene from "../js/GameScene.js";
export default class MemoryLeakGame extends BaseMiniGame {

    start() {

        console.log("Memory Leak Started");

        this.scene.openTask("Memory Leak");
    }

}