import characters from "@/assets/dungeons/characters.png";
import cloudCity from "@/assets/dungeons/tilemaps/cloud_city.json";
import cloudTileset from "@/assets/dungeons/tilesets/cloud_tileset.png";
import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { JoystickManager } from "@/models/dungeons/managers/JoystickManager";
import { MovementManager } from "@/models/dungeons/managers/MovementManager";
import { ScaleManager } from "@/models/dungeons/managers/ScaleManager";
import { addJoystick } from "@/services/dungeons/joystick";
import { GridEngine } from "grid-engine";
import isMobile from "is-mobile";
import { GameObjects, Scene } from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export class GameScene extends Scene {
  static readonly TILE_SIZE = 48;
  static readonly TILESET_KEY = "tiles";
  static readonly MAP_KEY = "cloud-city-map";
  static readonly PLAYER_SPRITESHEET_KEY = "player";
  scaleManager!: ScaleManager;
  movementManager!: MovementManager;
  joystickManager: JoystickManager | null = null;
  playerSprite!: GameObjects.Sprite;
  gridEngine!: GridEngine;
  rexVirtualJoystick!: VirtualJoystickPlugin;

  preload() {
    this.load.image(GameScene.TILESET_KEY, cloudTileset);
    this.load.tilemapTiledJSON(GameScene.MAP_KEY, cloudCity);
    this.load.spritesheet(GameScene.PLAYER_SPRITESHEET_KEY, characters, { frameWidth: 52, frameHeight: 72 });
  }

  create() {
    this.scaleManager = new ScaleManager(this.game.scale);
    this.movementManager = new MovementManager(this.gridEngine);
    if (isMobile()) this.joystickManager = new JoystickManager(addJoystick(this, this.rexVirtualJoystick));
    this.addPlayerSprite();
    this.addMap();

    this.cameras.main.startFollow(this.playerSprite, true);
    this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);
    phaserEventEmitter.on("onUpdateBackgroundColor", (color) => this.cameras.main.setBackgroundColor(color));
  }

  update() {
    if (this.joystickManager)
      this.movementManager.move(GameScene.PLAYER_SPRITESHEET_KEY, this.joystickManager.createCursorKeys());
    else if (this.input.keyboard)
      this.movementManager.move(GameScene.PLAYER_SPRITESHEET_KEY, this.input.keyboard.createCursorKeys());
  }

  addPlayerSprite = () => {
    this.playerSprite = this.add.sprite(0, 0, GameScene.PLAYER_SPRITESHEET_KEY);
    this.playerSprite.scale = 1.5;
  };

  addMap = () => {
    const cloudCityTilemap = this.make.tilemap({ key: GameScene.MAP_KEY });
    cloudCityTilemap.addTilesetImage("Cloud City", GameScene.TILESET_KEY);

    for (let i = 0; i < cloudCityTilemap.layers.length; i++) {
      const layer = cloudCityTilemap.createLayer(i, "Cloud City", 0, 0);
      if (!layer) continue;
      layer.scale = 3;
    }

    this.gridEngine.create(cloudCityTilemap, {
      characters: [
        {
          id: GameScene.PLAYER_SPRITESHEET_KEY,
          sprite: this.playerSprite,
          walkingAnimationMapping: 6,
          startPosition: { x: 8, y: 8 },
        },
      ],
      numberOfDirections: 8,
    });
  };
}
