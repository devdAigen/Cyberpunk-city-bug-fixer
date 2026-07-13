export default class Ship{

    constructor(scene){

        const g=scene.add.graphics();

        g.lineStyle(3,0xffffff);

        g.strokeRect(50,50,1180,620);

        g.strokeLineShape(new Phaser.Geom.Line(443,50,443,670));

        g.strokeLineShape(new Phaser.Geom.Line(836,50,836,670));

        g.strokeLineShape(new Phaser.Geom.Line(50,256,1230,256));

        g.strokeLineShape(new Phaser.Geom.Line(50,463,1230,463));

        scene.add.text(150,120,"Cockpit");

        scene.add.text(540,120,"Navigation");

        scene.add.text(930,120,"Electrical");

        scene.add.text(150,330,"Reactor");

        scene.add.text(540,330,"Storage");

        scene.add.text(930,330,"Engine");

        scene.add.text(150,540,"Oxygen");

        scene.add.text(540,540,"MedBay");

        scene.add.text(930,540,"Security");

    }

}