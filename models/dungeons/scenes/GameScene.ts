import characters from "@/assets/dungeons/characters.png";
import cloudCity from "@/assets/dungeons/tilemaps/cloud_city.json";
import cloudTileset from "@/assets/dungeons/tilesets/cloud_tileset.png";
import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { APP_BAR_HEIGHT } from "@/services/esposter/constants";
import { Direction, GridEngine } from "grid-engine";
import { Scene } from "phaser";

export class GameScene extends Scene {
  static readonly CANVAS_ASPECT_RATIO = 4 / 3;
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

    const canvasWidth = GameScene.getCanvasWidth();
    const canvasHeight = GameScene.getCanvasHeight();
    this.game.scale.resize(canvasWidth, canvasHeight);
    this.cameras.main.startFollow(playerSprite, true);
    this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);

    window.addEventListener("resize", () => {
      const canvasWidth = GameScene.getCanvasWidth();
      const canvasHeight = GameScene.getCanvasHeight();
      this.game.scale.resize(canvasWidth, canvasHeight);
      this.cameras.main.centerOn(playerSprite.x, playerSprite.y);
    });
    phaserEventEmitter.on("onUpdateBackgroundColor", (color) => this.cameras.main.setBackgroundColor(color));

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

  static getCanvasWidth = () => GameScene.getCanvasHeight() * GameScene.CANVAS_ASPECT_RATIO;
  static getCanvasHeight = () => window.innerHeight - APP_BAR_HEIGHT;
}
