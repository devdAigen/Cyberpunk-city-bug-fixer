// tasks/NavigationTask.js
import Task from "./Task.js";

export default class NavigationTask extends Task {
    constructor(scene, data) {
        super(scene, data, "MEDIUM", "Memory Leak");
    }
}
