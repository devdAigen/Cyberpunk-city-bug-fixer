export default class UIManager {

    constructor(scene) {

        this.scene = scene;

        this.popup = document.getElementById("popup");

        this.title = document.getElementById("popupTitle");

        this.content = document.getElementById("popupContent");

        document
            .getElementById("closePopup")
            .onclick = () => {

                this.close();

            };

    }

    open(title, html) {

        this.title.innerHTML = title;

        this.content.innerHTML = html;

        this.popup.classList.remove("hidden");

        this.scene.gamePaused = true;

    }

    close() {

        this.popup.classList.add("hidden");

        this.scene.gamePaused = false;

    }

}