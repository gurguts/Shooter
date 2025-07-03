import Phaser from 'phaser';
import { SPRITES, SIZES } from '../utils/constants.ts';

export class Player extends Phaser.GameObjects.Container {
    public physicalBody: Phaser.Physics.Arcade.Sprite;
    private bodySprite: Phaser.GameObjects.Sprite; // Renamed from 'body' to 'bodySprite'
    private head: Phaser.GameObjects.Sprite;
    private textureKey: string;
    private isFacingRight: boolean = true;
    private isMoving: boolean = false;
    private isJumping: boolean = false;
    private isCrouching: boolean = false;
    private moveSpeed: number = 200;
    private jumpSpeed: number = 400;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y);
        this.textureKey = texture;

        // Create physical body
        this.physicalBody = new Phaser.Physics.Arcade.Sprite(scene, x, y, texture, 0);
        scene.physics.add.existing(this.physicalBody);
        this.physicalBody.setGravityY(800);
        this.physicalBody.setCollideWorldBounds(true);

        // Set physical body size
        const bodyHeight = SIZES.PLAYER.BODY_HEIGHT * 0.5;
        const headOffset = 12;
        const totalHeight = bodyHeight + headOffset;
        this.physicalBody.setSize(SIZES.PLAYER.BODY_WIDTH * 0.3, totalHeight);
        this.physicalBody.setOffset(2.9 * headOffset, headOffset);

        // Create visual body sprite
        this.bodySprite = new Phaser.GameObjects.Sprite(scene, 0, 0, texture, 0);
        this.bodySprite.setOrigin(0.5, 0.5);
        this.bodySprite.setScale(0.5);
        this.add(this.bodySprite);

        // Create head
        this.head = new Phaser.GameObjects.Sprite(scene, 0, -27, SPRITES.PLAYER.HEAD, 0);
        this.head.setOrigin(0.5, 0.8);
        this.head.setScale(0.5);
        this.add(this.head);

        // Add container to scene
        scene.add.existing(this as Phaser.GameObjects.GameObject); // Type assertion

        // Create animations
        const anims = scene.anims;
        const animsFrameRate = 9;

        anims.create({
            key: 'run_right',
            frames: anims.generateFrameNumbers(this.textureKey, { start: 3, end: 5 }),
            frameRate: animsFrameRate,
            repeat: -1
        });

        anims.create({
            key: 'run_left',
            frames: anims.generateFrameNumbers(this.textureKey, { start: 8, end: 6 }),
            frameRate: animsFrameRate,
            repeat: -1
        });

        anims.create({
            key: 'run_right_reverse',
            frames: anims.generateFrameNumbers(this.textureKey, { start: 5, end: 3 }),
            frameRate: animsFrameRate,
            repeat: -1
        });

        anims.create({
            key: 'run_left_reverse',
            frames: anims.generateFrameNumbers(this.textureKey, { start: 6, end: 8 }),
            frameRate: animsFrameRate,
            repeat: -1
        });

        this.bodySprite.setFrame(0);
    }

    update(_: number) {
        const keys = this.scene.input.keyboard.createCursorKeys();
        const pointer = this.scene.input.activePointer;

        // Sync container position with physical body
        this.x = this.physicalBody.x;
        this.y = this.physicalBody.y;

        // Determine facing direction based on mouse position
        const camera = this.scene.cameras.main;
        const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
        this.isFacingRight = worldPoint.x > this.x;

        // Reset flags
        this.isMoving = false;
        this.isCrouching = false;

        // Check if on ground
        const isOnGround = (this.physicalBody.body as Phaser.Physics.Arcade.Body).blocked.down;

        // Reset isJumping on landing
        if (isOnGround && this.isJumping) {
            this.isJumping = false;
        }

        // Handle input
        if (keys.up.isDown && !keys.down.isDown && isOnGround && !this.isJumping) {
            this.isJumping = true;
            this.physicalBody.setVelocityY(-this.jumpSpeed);
            console.log('Jump triggered');
        } else if (keys.down.isDown) {
            this.isCrouching = true;
            this.physicalBody.setVelocityX(0);
        } else if (keys.left.isDown && !keys.right.isDown) {
            this.isMoving = true;
            this.physicalBody.setVelocityX(-this.moveSpeed);
        } else if (keys.right.isDown && !keys.left.isDown) {
            this.isMoving = true;
            this.physicalBody.setVelocityX(this.moveSpeed);
        } else {
            this.physicalBody.setVelocityX(0);
        }

        // Manage body animations
        if (this.isJumping) {
            this.bodySprite.setFrame(this.isFacingRight ? 3 : 8);
        } else if (this.isCrouching) {
            this.bodySprite.setFrame(this.isFacingRight ? 9 : 10);
        } else if (this.isMoving) {
            if (keys.left.isDown && this.isFacingRight) {
                this.bodySprite.play('run_right_reverse', true);
            } else if (keys.left.isDown && !this.isFacingRight) {
                this.bodySprite.play('run_left', true);
            } else if (keys.right.isDown && this.isFacingRight) {
                this.bodySprite.play('run_right', true);
            } else if (keys.right.isDown && !this.isFacingRight) {
                this.bodySprite.play('run_left_reverse', true);
            }
        } else {
            this.bodySprite.stop();
            this.bodySprite.setFrame(this.isFacingRight ? 0 : 1);
        }

        // Manage head frame
        this.head.setFrame(this.isFacingRight ? 0 : 1);

        // Rotate head toward mouse
        let angleToPointer = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
        if (!this.isFacingRight) {
            angleToPointer = Math.PI + angleToPointer;
        }
        this.head.rotation = angleToPointer;

        // Debug for jump
        if (keys.up.isDown) {
            console.log(`Up pressed, isOnGround: ${isOnGround}, isJumping: ${this.isJumping}`);
        }
    }
}