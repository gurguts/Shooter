import Phaser from 'phaser';
import {createPlayerAnimations} from "./createPlayerAnimations.ts";
import {PlayerControls} from './playerControls';
import {createPlayerSprites} from "./PlayerSprites.ts";

export class Player extends Phaser.GameObjects.Container {
    public physicalBody: Phaser.Physics.Arcade.Sprite;
    private bodySprite: Phaser.GameObjects.Sprite;
    private head: Phaser.GameObjects.Sprite;
    private hand: Phaser.GameObjects.Sprite;
    private weapon: Phaser.GameObjects.Sprite;
    private textureKey: string;
    private moveSpeed: number = 300;
    private jumpSpeed: number = 500;

    private originalBodyHeight: number;
    private originalBodyOffsetY: number;

    private originalHeadY: number;
    private originalHandY: number;
    private originalWeaponY: number;

    private controls: PlayerControls;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y);
        this.textureKey = texture;

        const sprites = createPlayerSprites(scene, x, y, texture);
        this.physicalBody = sprites.physicalBody;
        this.bodySprite = sprites.bodySprite;
        this.head = sprites.head;
        this.hand = sprites.hand;
        this.weapon = sprites.weapon;
        this.originalBodyHeight = sprites.originalBodyHeight;
        this.originalBodyOffsetY = sprites.originalBodyOffsetY;
        this.originalHeadY = sprites.originalHeadY;
        this.originalHandY = sprites.originalHandY;
        this.originalWeaponY = sprites.originalWeaponY;

        this.add([this.bodySprite, this.head, this.hand, this.weapon]);
        scene.add.existing(this as Phaser.GameObjects.GameObject);

        createPlayerAnimations(scene, this.textureKey);
        this.bodySprite.setFrame(0);

        this.controls = new PlayerControls(scene, {
            physicalBody: this.physicalBody,
            bodySprite: this.bodySprite,
            head: this.head,
            hand: this.hand,
            weapon: this.weapon,
            moveSpeed: this.moveSpeed,
            jumpSpeed: this.jumpSpeed,
            originalBodyHeight: this.originalBodyHeight,
            originalBodyOffsetY: this.originalBodyOffsetY,
            originalHeadY: this.originalHeadY,
            originalHandY: this.originalHandY,
            originalWeaponY: this.originalWeaponY
        });
    }

    update(time: number) {
        this.x = this.physicalBody.x;
        this.y = this.physicalBody.y;
        this.controls.update(time);
    }
}