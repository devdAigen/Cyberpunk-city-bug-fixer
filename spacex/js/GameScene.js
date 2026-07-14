import Player from "../entities/Player.js";
// import Phaser from "phaser";
import EngineTask from "../tasks/EngineTask.js";
import NavigationTask from "../tasks/NavigationTask.js";
import ReactorTask from "../tasks/ReactorTask.js";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }




    create() {

        const map = this.make.tilemap({
            key: "ship"
        });
        const tileset = map.addTilesetImage(
            "tilesheet",
            "tilesheet"
        );

        console.log("Tileset:", tileset);

        const taskObject = map.getObjectLayer("taskObject");

        taskObject.objects.forEach(task => {
            console.log(task.name);
            console.log(task.type);
            console.log(task.x, task.y);
        });

        map.createLayer("Ground", tileset, 0, 0);
        const collisionLayer = map.createLayer("Object", tileset);
        map.createLayer("Tile Layer 1", tileset, 0, 0);


        map.createLayer("task", tileset, 0, 0);
        //  map.createLayer("taskObject", objectgroup, 0, 0);
        // map.createLayer("Object", tileset, 0, 0);
        this.player = new Player(this, 300, 300);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.cameras.main.setBackgroundColor("#333333");
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2);

        // const collisionLayer = map.createLayer("Collision", tileset);
        collisionLayer.setCollisionByExclusion([-1]);
        collisionLayer.renderDebug(this.add.graphics(), {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 120)
        });

        this.physics.add.collider(this.player, collisionLayer);
        //task implemntation

        this.tasks = [];

        taskObject.objects.forEach(task => {
            console.log(task.name, task.type, task.x, task.y);
            let taskClass;

            switch (task.name) {

                case "Engine":
                    taskClass = new EngineTask(this, task);
                    break;

                case "Navigation":
                    taskClass = new NavigationTask(this, task);
                    break;

                case "Reactor":
                    taskClass = new ReactorTask(this, task);
                    break;

            }

            this.tasks.push(taskClass);
            console.log("Task added:", taskClass);

        });

    }

    update() {

        const speed = 200;

        this.player.setVelocity(0);

        if (this.cursors.left.isDown)
            this.player.setVelocityX(-speed);

        if (this.cursors.right.isDown)
            this.player.setVelocityX(speed);

        if (this.cursors.up.isDown)
            this.player.setVelocityY(-speed);

        if (this.cursors.down.isDown)
            this.player.setVelocityY(speed);


        let nearbyTask = null;

        this.tasks.forEach(task => {

            if (task.completed) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                task.data.x,
                task.data.y
            );

            if (distance < 50) {
                nearbyTask = task;
            }

        });

        if (nearbyTask && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            console.log("Starting:", nearbyTask.data.name);
            nearbyTask.start();
        }

    }
}