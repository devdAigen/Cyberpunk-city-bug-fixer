export default class BaseMiniGame {

    constructor(scene) {
        this.scene = scene;
    }

    start() {
    }

    update() {
    }

    complete() {

         this.scene.ui.close();

    console.log("Mini game complete");
    }

    fail() {

        console.log("Mini-game failed");

        this.scene.ui.close();
    }
}