export default class BaseTask {

    constructor(scene, taskData) {

        this.scene = scene;
        this.data = taskData;

        this.completed = false;
    }

    start() {

    }

    complete() {

        this.completed = true;

        console.log(this.data.name + " Completed");
    }

}