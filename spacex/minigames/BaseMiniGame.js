export default class BaseMiniGame {

    constructor(scene) {
        this.scene = scene;
    }

    start() {
    }

    update() {
    }

    complete() {

        console.log("Mini-game completed");

        this.scene.closeTask();
    }

    fail() {

        console.log("Mini-game failed");

        this.scene.closeTask();
    }
}