export default class PopupWindow {

    constructor(scene) {

        this.scene = scene;

        this.container = scene.add.container(0, 0);

        this.container.setDepth(1000);

        this.container.setVisible(false);

        // Dark background
        this.overlay = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.65
        );

        this.overlay.setOrigin(0);

        // Main window
        this.window = scene.add.rectangle(
            scene.scale.width / 2,
            scene.scale.height / 2,
            700,
            500,
            0x1d2430
        );

        this.window.setStrokeStyle(3, 0x4caf50);

        // Title
        this.title = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height / 2 - 220,
            "",
            {
                fontSize: "28px",
                color: "#ffffff"
            }
        ).setOrigin(0.5);

        this.container.add([
            this.overlay,
            this.window,
            this.title
        ]);

    }

    open(title){

        this.title.setText(title);

        this.container.setVisible(true);

    }

    close(){

        this.container.setVisible(false);

    }

}