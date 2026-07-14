import BaseTask from "./BaseTask.js";
import MemoryLeakGame from "../minigames/MemoryLeakGame.js";
export default class EngineTask extends BaseTask {

    
    start() {

        console.log("Opening Engine Repair");
        const game = new MemoryLeakGame(this.scene);
        game.start();
    }

}