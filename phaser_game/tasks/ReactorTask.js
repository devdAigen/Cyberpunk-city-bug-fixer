// tasks/ReactorTask.js
import Task from "./Task.js";

export default class ReactorTask extends Task {
    constructor(scene, data) {
        super(scene, data, "HIGH", "Memory Leak");
    }
}
