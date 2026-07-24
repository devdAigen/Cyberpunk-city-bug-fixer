import Player from "../entities/Player.js";
// import Phaser from "phaser";
import EngineTask from "../tasks/EngineTask.js";
import NavigationTask from "../tasks/NavigationTask.js";
import ReactorTask from "../tasks/ReactorTask.js";
import UIManager from "../Ui/UIManager.js";

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


        map.createLayer("Ground", tileset, 0, 0);
        const collisionLayer = map.createLayer("Object", tileset);
        map.createLayer("Tile Layer 1", tileset, 0, 0);


        map.createLayer("task", tileset, 0, 0);
        this.player = new Player(this, 300, 300);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.cameras.main.setBackgroundColor("#333333");
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;

        console.log(mapWidth, mapHeight);

        collisionLayer.setCollisionByExclusion([-1]);
    
        this.physics.add.collider(this.player, collisionLayer);
        //task implemntation

        this.tasks = [];

        taskObject.objects.forEach(task => {
     //       console.log(task.name, task.type, task.x, task.y);
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

         this.ui = new UIManager(this);

console.log(this.ui);
        console.log("Map Width (tiles):", map.width);
console.log("Map Height (tiles):", map.height);

console.log("Tile Width:", map.tileWidth);
console.log("Tile Height:", map.tileHeight);

console.log("World Width:", map.widthInPixels);
console.log("World Height:", map.heightInPixels);

map.layers.forEach(layer => {
    console.log(layer.name);
    console.log("Offset X:", layer.tilemapLayer?.x);
    console.log("Offset Y:", layer.tilemapLayer?.y);
});
console.log(this.cameras.main.width);
console.log(this.cameras.main.height);

// const zoomX = this.cameras.main.width / map.widthInPixels;
// const zoomY = this.cameras.main.height / map.heightInPixels;

// const zoom = Math.min(zoomX, zoomY);

// this.cameras.main.setZoom(zoom);

// this.cameras.main.centerOn(
//     map.widthInPixels / 2,
//     map.heightInPixels / 2
// );


    this.gamePaused = false;

    
    }

    openTask(title) {
        this.gamePaused = true;

    this.ui.open(title, "html");
    }

    closeTask() {
        this.gamePaused = false;
        this.ui.close();
    }

    update() {

        if (this.gamePaused) {
            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                this.closeTask();
            }
            return;
        }

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

        // if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
        //     this.gamePaused = false;
        //     this.popup.open("Memory Leak");
        // }

        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.gamePaused = false;
            this.ui.close();
        }


    }
}