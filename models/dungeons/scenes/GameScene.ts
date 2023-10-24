import characters from "@/assets/dungeons/characters.png";
import cloudCity from "@/assets/dungeons/tilemaps/cloud_city.json";
import cloudTileset from "@/assets/dungeons/tilesets/cloud_tileset.png";
import { Direction, GridEngine } from "grid-engine";
import * as Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  static readonly TILE_SIZE = 48;
  static readonly TILESET_KEY = "tiles";
  static readonly MAP_KEY = "cloud-city-map";
  static readonly PLAYER_SPRITESHEET_KEY = "player";
  gridEngine!: GridEngine;

  preload() {
    this.load.image(GameScene.TILESET_KEY, cloudTileset);
    this.load.tilemapTiledJSON(GameScene.MAP_KEY, cloudCity);
    this.load.spritesheet(GameScene.PLAYER_SPRITESHEET_KEY, characters, { frameWidth: 52, frameHeight: 72 });
  }

  create() {
    const cloudCityTilemap = this.make.tilemap({ key: GameScene.MAP_KEY });
    cloudCityTilemap.addTilesetImage("Cloud City", GameScene.TILESET_KEY);

    for (let i = 0; i < cloudCityTilemap.layers.length; i++) {
      const layer = cloudCityTilemap.createLayer(i, "Cloud City", 0, 0);
      if (!layer) continue;
      layer.scale = 3;
    }

    const playerSprite = this.add.sprite(0, 0, GameScene.PLAYER_SPRITESHEET_KEY);
    playerSprite.scale = 1.5;
    this.cameras.main.startFollow(playerSprite, true);
    this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);
    this.gridEngine.create(cloudCityTilemap, {
      characters: [
        {
          id: GameScene.PLAYER_SPRITESHEET_KEY,
          sprite: playerSprite,
          walkingAnimationMapping: 6,
          startPosition: { x: 8, y: 8 },
        },
      ],
    });
  }

  update() {
    if (!this.input.keyboard) return;

    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) this.gridEngine.move("player", Direction.LEFT);
    else if (cursors.right.isDown) this.gridEngine.move("player", Direction.RIGHT);
    else if (cursors.up.isDown) this.gridEngine.move("player", Direction.UP);
    else if (cursors.down.isDown) this.gridEngine.move("player", Direction.DOWN);
  }
}
