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
        this.load.spritesheet(SPRITES.PLAYER, 'src/assets/characters/firstPlayer_v2.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT,
        })
    }

    create(){
        const map = this.make.tilemap({key:"map"});
        const tileset = map.addTilesetImage(location_educationJSON.tilesets[0].name, TILES.LOCATION_EDUCATION, SIZES.TILE, SIZES.TILE);
        const groundLayer = map. createLayer(LAYERS.WALLS, tileset, 0, 0);

        this.player = new Player(this, 400, 250, SPRITES.PLAYER);
    }

    update(_: number, delta:number):void{
        this.player.update(delta);
    }
}