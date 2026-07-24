import BaseMiniGame from "./BaseMiniGame.js";
import GameScene from "../js/GameScene.js";
export default class MemoryLeakGame extends BaseMiniGame {

      start() {

        this.scene.ui.open(

            "Memory Leak",

            `
            <h2>Memory Leak Detected</h2>

            <p>RAM Usage</p>

            <progress value="65" max="100" style="width:100%;height:25px;"></progress>

            <br><br>

            <button id="repairBtn">

                Repair Memory

            </button>
            `
        );

        document
            .getElementById("repairBtn")
            .onclick = () => {

                alert("Memory Fixed");

                this.complete();

            };

    }

}