// tasks/EngineTask.js
import Task from "./Task.js";

export default class EngineTask extends Task {
    constructor(scene, data) {
        super(scene, data, "LOW", "Memory Leak");
    }
}
