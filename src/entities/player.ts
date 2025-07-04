import Phaser from 'phaser';
import { SPRITES, SIZES } from '../utils/constants.ts';

export class Player extends Phaser.GameObjects.Container {
    public physicalBody: Phaser.Physics.Arcade.Sprite;
    private bodySprite: Phaser.GameObjects.Sprite;
    private head: Phaser.GameObjects.Sprite;
    private hand: Phaser.GameObjects.Sprite;
    private weapon: Phaser.GameObjects.Sprite;
    private textureKey: string;
    private isFacingRight: boolean = true;
    private isMoving: boolean = false;
    private isJumping: boolean = false;
    private isCrouching: boolean = false;
    private moveSpeed: number = 300;
    private jumpSpeed: number = 500;
    // Store original physical body dimensions and offset
    private originalBodyHeight: number;
    private originalBodyOffsetY: number;
    // Store original sprite positions
    private originalHeadY: number;
    private originalHandY: number;
    private originalWeaponY: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y);
        this.textureKey = texture;

        // Create physical body
        this.physicalBody = new Phaser.Physics.Arcade.Sprite(scene, x, y, texture, 0);
        scene.physics.add.existing(this.physicalBody);
        this.physicalBody.setGravityY(1100);
        this.physicalBody.setCollideWorldBounds(true);

        // Set physical body size
        const bodyHeight = SIZES.PLAYER.BODY_HEIGHT * 0.5;
        const headOffset = 12;
        const totalHeight = bodyHeight + headOffset;
        this.physicalBody.setSize(SIZES.PLAYER.BODY_WIDTH * 0.3, totalHeight);
        this.physicalBody.setOffset(2.9 * headOffset, headOffset);

        // Store original dimensions and offset
        this.originalBodyHeight = totalHeight;
        this.originalBodyOffsetY = headOffset;

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
        this.originalHeadY = -27; // Store original head Y position

        // Create hand
        this.hand = new Phaser.GameObjects.Sprite(scene, -8, -20, SPRITES.PLAYER.HAND, 0);
        this.hand.setScale(0.5);
        this.add(this.hand);
        this.originalHandY = -20; // Store original hand Y position

        // Create weapon
        this.weapon = new Phaser.GameObjects.Sprite(scene, 8, -20, SPRITES.WEAPON.GUN, 0);
        this.weapon.setScale(0.5);
        this.add(this.weapon);
        this.originalWeaponY = -20; // Store original weapon Y position

        // Add container to scene
        scene.add.existing(this as Phaser.GameObjects.GameObject);

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
        const wasdKeys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        }) as { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
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
        const wasCrouching = this.isCrouching; // Track previous crouch state
        this.isCrouching = false;

        // Check if on ground
        const isOnGround = (this.physicalBody.body as Phaser.Physics.Arcade.Body).blocked.down;

        // Reset isJumping on landing
        if (isOnGround && this.isJumping) {
            this.isJumping = false;
        }

// Handle input
        if ((keys.up.isDown || wasdKeys.up.isDown) && !(keys.down.isDown || wasdKeys.down.isDown) && isOnGround && !this.isJumping) {
            this.isJumping = true;
            this.physicalBody.setVelocityY(-this.jumpSpeed);
            console.log('Jump triggered');
        } else if ((keys.down.isDown || wasdKeys.down.isDown) && isOnGround) { // Added isOnGround check
            this.isCrouching = true;
            this.physicalBody.setVelocityX(0);
        } else if ((keys.left.isDown || wasdKeys.left.isDown) && !(keys.right.isDown || wasdKeys.right.isDown)) {
            this.isMoving = true;
            this.physicalBody.setVelocityX(-this.moveSpeed);
        } else if ((keys.right.isDown || wasdKeys.right.isDown) && !(keys.left.isDown || wasdKeys.left.isDown)) {
            this.isMoving = true;
            this.physicalBody.setVelocityX(this.moveSpeed);
        } else {
            this.physicalBody.setVelocityX(0);
        }

        // Handle crouching physical and visual adjustments
        const crouchHeightReduction = this.originalBodyHeight * 0.3; // Reduce height by 30% when crouching
        if (this.isCrouching && !wasCrouching) {
            // Adjust physical body size and offset
            const newHeight = this.originalBodyHeight - crouchHeightReduction;
            const newOffsetY = this.originalBodyOffsetY + crouchHeightReduction;
            this.physicalBody.setSize(
                SIZES.PLAYER.BODY_WIDTH * 0.3,
                newHeight
            );
            this.physicalBody.setOffset(2.9 * this.originalBodyOffsetY, newOffsetY);

            // Lower visual components
            const crouchOffset = crouchHeightReduction; // Same offset for visual alignment
            this.head.y = this.originalHeadY + crouchOffset;
            this.hand.y = this.originalHandY + crouchOffset;
            this.weapon.y = this.originalWeaponY + crouchOffset;
        } else if (!this.isCrouching && wasCrouching) {
            // Restore physical body size and offset
            this.physicalBody.setSize(
                SIZES.PLAYER.BODY_WIDTH * 0.3,
                this.originalBodyHeight
            );
            this.physicalBody.setOffset(2.9 * this.originalBodyOffsetY, this.originalBodyOffsetY);

            // Restore visual components
            this.head.y = this.originalHeadY;
            this.hand.y = this.originalHandY;
            this.weapon.y = this.originalWeaponY;
        }

// Manage body animations
        if (this.isJumping) {
            this.bodySprite.setFrame(this.isFacingRight ? 3 : 8);
        } else if (this.isCrouching) {
            this.bodySprite.setFrame(this.isFacingRight ? 9 : 10);
        } else if (this.isMoving) {
            if ((keys.left.isDown || wasdKeys.left.isDown) && this.isFacingRight) {
                this.bodySprite.play('run_right_reverse', true);
            } else if ((keys.left.isDown || wasdKeys.left.isDown) && !this.isFacingRight) {
                this.bodySprite.play('run_left', true);
            } else if ((keys.right.isDown || wasdKeys.right.isDown) && this.isFacingRight) {
                this.bodySprite.play('run_right', true);
            } else if ((keys.right.isDown || wasdKeys.right.isDown) && !this.isFacingRight) {
                this.bodySprite.play('run_left_reverse', true);
            }
        } else {
            this.bodySprite.stop();
            this.bodySprite.setFrame(this.isFacingRight ? 0 : 1);
        }

        // Manage head, hand, and weapon frames
        this.head.setFrame(this.isFacingRight ? 0 : 1);
        this.hand.setFrame(this.isFacingRight ? 0 : 1);
        this.weapon.setFrame(this.isFacingRight ? 0 : 1);

        // Adjust positions for facing direction
        if (this.isFacingRight) {
            this.hand.setPosition(-8, this.hand.y); // Maintain adjusted Y
            this.hand.setOrigin(0.2, 0.2);

            this.weapon.setPosition(-10, this.weapon.y); // Maintain adjusted Y
            this.weapon.setOrigin(-1.5, -0.8);
        } else {
            this.hand.setPosition(7, this.hand.y); // Maintain adjusted Y
            this.hand.setOrigin(0.8, 0.2);

            this.weapon.setPosition(9, this.weapon.y); // Maintain adjusted Y
            this.weapon.setOrigin(2.5, -0.8);
        }

        // Rotate head, hand, and weapon toward mouse
        let angleToPointer = Phaser.Math.Angle.Between(
            this.x,
            this.y + this.head.y, // Use adjusted head Y position
            worldPoint.x,
            worldPoint.y
        );
        if (!this.isFacingRight) {
            angleToPointer = Math.PI + angleToPointer;
        }
        this.head.rotation = angleToPointer;
        this.hand.rotation = angleToPointer;
        this.weapon.rotation = angleToPointer;
    }
}