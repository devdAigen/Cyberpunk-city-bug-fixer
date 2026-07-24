// tasks/CommsTask.js
import Task from "./Task.js";

export default class CommsTask extends Task {
    constructor(scene, data) {
        super(scene, data, "MEDIUM", "Memory Leak");
    }
}
