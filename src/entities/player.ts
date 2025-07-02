import {Entity} from "./entity.ts";
import {SPRITES} from "../utils/constants.ts";

export class Player extends Entity {
    textureKey: string;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture, SPRITES.PLAYER);
        this.setScale(0.5);

        const anims = this.scene.anims;
        const animsFrameRate = 9;
        this.textureKey = texture;

        anims.create({
            key: 'right',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 3,
                end:5
            }),
            frameRate: animsFrameRate,
            repeat:-1
        })
        anims.create({
            key: 'left',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 6,
                end:8
            }),
            frameRate: animsFrameRate,
            repeat:-1
        })
        anims.create({
            key: 'top',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 0,
                end:0
            }),
            frameRate: animsFrameRate,
            repeat:-1
        })
        anims.create({
            key: 'down',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 9,
                end:9
            }),
            frameRate: animsFrameRate,
            repeat:-1
        })
    }

    update(delta: number) {
        const keys = this.scene.input.keyboard.createCursorKeys();

        if (keys.up.isDown) {
            this.play('up', true);
            this.setPosition(this.x, this.y - delta * 0.25)
        } else if (keys.down.isDown) {
            this.play('down', true);
            this.setPosition(this.x, this.y + delta * 0.25)
        } else if (keys.left.isDown) {
            this.play('left', true);
            this.setPosition(this.x - delta * 0.25, this.y)
        } else if (keys.right.isDown) {
            this.play('right', true);
            this.setPosition(this.x + delta * 0.25, this.y)
        } else{
            this.stop();
        }
    }
}