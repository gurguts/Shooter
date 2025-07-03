import location_educationJSON from '../assets/location_education.json';
import {LAYERS, SIZES, SPRITES, TILES} from "../utils/constants.ts";
import {Player} from "../entities/player.ts";

export class LocationEducation extends Phaser.Scene {
    private player?:Player;

    constructor() {
        super('LocationEducationScene');
    }

    preload(){
        this.load.image(TILES.LOCATION_EDUCATION, 'src/assets/floors.png')
        this.load.tilemapTiledJSON('map', 'src/assets/location_education.json');
        this.load.spritesheet(SPRITES.PLAYER.BODY, 'src/assets/characters/firstPlayer_v2.png', {
            frameWidth: SIZES.PLAYER.BODY_WIDTH,
            frameHeight: SIZES.PLAYER.BODY_HEIGHT,
        });
        this.load.spritesheet(SPRITES.PLAYER.HEAD, 'src/assets/characters/firstPlayerHead.png', {
            frameWidth: SIZES.PLAYER.HEAD_WIDTH,
            frameHeight: SIZES.PLAYER.HEAD_HEIGHT,
        });
    }

    create() {
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage(location_educationJSON.tilesets[0].name, TILES.LOCATION_EDUCATION, SIZES.TILE, SIZES.TILE);
        const groundLayer = map.createLayer(LAYERS.GROUND, tileset, 0, 0);
        map.createLayer(LAYERS.SPACE, tileset, 0, 0);

        this.player = new Player(this, 400, 300, SPRITES.PLAYER.BODY);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);


        groundLayer.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player.physicalBody, groundLayer);

        this.physics.add.collider(this.player.physicalBody, groundLayer, () => {
            console.log('Collision detected between player and ground!');
        });

    }

    update(_: number, delta:number):void{
        this.cameras.main.roundPixels = true;
        this.player.update(delta);
    }
}