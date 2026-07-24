// tasks/LifeSupportTask.js
import Task from "./Task.js";

export default class LifeSupportTask extends Task {
    constructor(scene, data) {
        super(scene, data, "LOW", "Memory Leak");
    }
}
