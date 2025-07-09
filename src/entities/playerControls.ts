// playerControls.ts
import Phaser from 'phaser';
import {SIZES} from "../utils/constants.ts";

interface PlayerControlsConfig {
    physicalBody: Phaser.Physics.Arcade.Sprite;
    bodySprite: Phaser.GameObjects.Sprite;
    head: Phaser.GameObjects.Sprite;
    hand: Phaser.GameObjects.Sprite;
    weapon: Phaser.GameObjects.Sprite;
    moveSpeed: number;
    jumpSpeed: number;
    originalBodyHeight: number;
    originalBodyOffsetY: number;
    originalHeadY: number;
    originalHandY: number;
    originalWeaponY: number;
}

export class PlayerControls {
    private config: PlayerControlsConfig;
    private scene: Phaser.Scene;
    private isFacingRight: boolean = true;
    private isMoving: boolean = false;
    private isJumping: boolean = false;
    private isCrouching: boolean = false;

    constructor(scene: Phaser.Scene, config: PlayerControlsConfig) {
        this.scene = scene;
        this.config = config;
    }

    update(_: number) {
        const keys = this.scene.input.keyboard.createCursorKeys();
        const wasdKeys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        }) as { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
        const pointer = this.scene.input.activePointer;

        const { physicalBody, bodySprite, head, hand, weapon } = this.config;
        const camera = this.scene.cameras.main;
        const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
        this.isFacingRight = worldPoint.x > physicalBody.x;

        this.isMoving = false;
        const wasCrouching = this.isCrouching;
        this.isCrouching = false;

        const isOnGround = (physicalBody.body as Phaser.Physics.Arcade.Body).blocked.down;

        if (isOnGround && this.isJumping) {
            this.isJumping = false;
        }

        if ((keys.up.isDown || wasdKeys.up.isDown) && !(keys.down.isDown || wasdKeys.down.isDown) && isOnGround && !this.isJumping) {
            this.isJumping = true;
            physicalBody.setVelocityY(-this.config.jumpSpeed);
        } else if ((keys.down.isDown || wasdKeys.down.isDown) && isOnGround) {
            this.isCrouching = true;
            physicalBody.setVelocityX(0);
        } else if ((keys.left.isDown || wasdKeys.left.isDown) && !(keys.right.isDown || wasdKeys.right.isDown)) {
            this.isMoving = true;
            physicalBody.setVelocityX(-this.config.moveSpeed);
        } else if ((keys.right.isDown || wasdKeys.right.isDown) && !(keys.left.isDown || wasdKeys.left.isDown)) {
            this.isMoving = true;
            physicalBody.setVelocityX(this.config.moveSpeed);
        } else {
            physicalBody.setVelocityX(0);
        }

        const crouchHeightReduction = this.config.originalBodyHeight * 0.3;
        if (this.isCrouching && !wasCrouching) {
            const newHeight = this.config.originalBodyHeight - crouchHeightReduction;
            const newOffsetY = this.config.originalBodyOffsetY + crouchHeightReduction;
            physicalBody.setSize(
                SIZES.PLAYER.BODY_WIDTH * 0.3,
                newHeight
            );
            physicalBody.setOffset(2.9 * this.config.originalBodyOffsetY, newOffsetY);

            const crouchOffset = crouchHeightReduction;
            head.y = this.config.originalHeadY + crouchOffset;
            hand.y = this.config.originalHandY + crouchOffset;
            weapon.y = this.config.originalWeaponY + crouchOffset;
        } else if (!this.isCrouching && wasCrouching) {
            physicalBody.setSize(
                SIZES.PLAYER.BODY_WIDTH * 0.3,
                this.config.originalBodyHeight
            );
            physicalBody.setOffset(2.9 * this.config.originalBodyOffsetY, this.config.originalBodyOffsetY);

            head.y = this.config.originalHeadY;
            hand.y = this.config.originalHandY;
            weapon.y = this.config.originalWeaponY;
        }

        if (this.isJumping) {
            bodySprite.setFrame(this.isFacingRight ? 3 : 8);
        } else if (this.isCrouching) {
            bodySprite.setFrame(this.isFacingRight ? 9 : 10);
        } else if (this.isMoving) {
            if ((keys.left.isDown || wasdKeys.left.isDown) && this.isFacingRight) {
                bodySprite.play('run_right_reverse', true);
            } else if ((keys.left.isDown || wasdKeys.left.isDown) && !this.isFacingRight) {
                bodySprite.play('run_left', true);
            } else if ((keys.right.isDown || wasdKeys.right.isDown) && this.isFacingRight) {
                bodySprite.play('run_right', true);
            } else if ((keys.right.isDown || wasdKeys.right.isDown) && !this.isFacingRight) {
                bodySprite.play('run_left_reverse', true);
            }
        } else {
            bodySprite.stop();
            bodySprite.setFrame(this.isFacingRight ? 0 : 1);
        }

        head.setFrame(this.isFacingRight ? 0 : 1);
        hand.setFrame(this.isFacingRight ? 0 : 1);
        weapon.setFrame(this.isFacingRight ? 0 : 1);

        if (this.isFacingRight) {
            hand.setPosition(-8, hand.y);
            hand.setOrigin(0.2, 0.2);
            weapon.setPosition(-10, weapon.y);
            weapon.setOrigin(-1.5, -0.8);
        } else {
            hand.setPosition(7, hand.y);
            hand.setOrigin(0.8, 0.2);
            weapon.setPosition(9, weapon.y);
            weapon.setOrigin(2.5, -0.8);
        }

        let angleToPointer = Phaser.Math.Angle.Between(
            physicalBody.x,
            physicalBody.y + head.y,
            worldPoint.x,
            worldPoint.y
        );
        if (!this.isFacingRight) {
            angleToPointer = Math.PI + angleToPointer;
        }
        head.rotation = angleToPointer;
        hand.rotation = angleToPointer;
        weapon.rotation = angleToPointer;
    }
}