import characters from "@/assets/dungeons/characters.png";
import cloudCity from "@/assets/dungeons/tilemaps/cloud_city.json";
import cloudTileset from "@/assets/dungeons/tilesets/cloud_tileset.png";
import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { APP_BAR_HEIGHT } from "@/services/esposter/constants";
import { Direction, GridEngine } from "grid-engine";
import { GameObjects, Input, Scene } from "phaser";
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export class GameScene extends Scene {
  static readonly CANVAS_ASPECT_RATIO = 4 / 3;
  static readonly JOYSTICK_RADIUS = 50;
  static readonly TILE_SIZE = 48;
  static readonly TILESET_KEY = "tiles";
  static readonly MAP_KEY = "cloud-city-map";
  static readonly PLAYER_SPRITESHEET_KEY = "player";
  playerSprite!: GameObjects.Sprite;
  gridEngine!: GridEngine;
  rexVirtualJoystick!: VirtualJoystickPlugin;
  virtualJoystick!: VirtualJoystick;

  preload() {
    this.load.image(GameScene.TILESET_KEY, cloudTileset);
    this.load.tilemapTiledJSON(GameScene.MAP_KEY, cloudCity);
    this.load.spritesheet(GameScene.PLAYER_SPRITESHEET_KEY, characters, { frameWidth: 52, frameHeight: 72 });
  }

  create() {
    this.addPlayerSprite();
    this.addMap();
    if (this.isMobile()) this.addJoystick();

    this.cameras.main.startFollow(this.playerSprite, true);
    this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);
    phaserEventEmitter.on("onUpdateBackgroundColor", (color) => this.cameras.main.setBackgroundColor(color));

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  update() {
    if (this.input.keyboard) this.move(this.input.keyboard.createCursorKeys());
    else if (this.isMobile()) this.move(this.virtualJoystick.createCursorKeys());
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

  addJoystick = () => {
    const canvasHeight = GameScene.getCanvasHeight();
    this.virtualJoystick = this.rexVirtualJoystick.add(this, {
      x: GameScene.JOYSTICK_RADIUS * 2,
      y: canvasHeight - GameScene.JOYSTICK_RADIUS * 2,
      radius: GameScene.JOYSTICK_RADIUS,
      base: this.add.circle(0, 0, GameScene.JOYSTICK_RADIUS, 0x888888),
      thumb: this.add.circle(0, 0, GameScene.JOYSTICK_RADIUS / 2, 0xcccccc),
    });
  };

  resize() {
    const canvasWidth = GameScene.getCanvasWidth();
    const canvasHeight = GameScene.getCanvasHeight();
    this.game.scale.resize(canvasWidth, canvasHeight);
    if (this.isMobile()) this.virtualJoystick.y = canvasHeight - GameScene.JOYSTICK_RADIUS * 2;
  }

  move(cursors: {
    up: Input.Keyboard.Key;
    down: Input.Keyboard.Key;
    left: Input.Keyboard.Key;
    right: Input.Keyboard.Key;
  }) {
    if (cursors.left.isDown && cursors.up.isDown) this.gridEngine.move("player", Direction.UP_LEFT);
    else if (cursors.left.isDown && cursors.down.isDown) this.gridEngine.move("player", Direction.DOWN_LEFT);
    else if (cursors.right.isDown && cursors.up.isDown) this.gridEngine.move("player", Direction.UP_RIGHT);
    else if (cursors.right.isDown && cursors.down.isDown) this.gridEngine.move("player", Direction.DOWN_RIGHT);
    else if (cursors.left.isDown) this.gridEngine.move("player", Direction.LEFT);
    else if (cursors.right.isDown) this.gridEngine.move("player", Direction.RIGHT);
    else if (cursors.up.isDown) this.gridEngine.move("player", Direction.UP);
    else if (cursors.down.isDown) this.gridEngine.move("player", Direction.DOWN);
  }

  isMobile = () => this.game.device.os.android || this.game.device.os.iOS;

  static getCanvasWidth = () => GameScene.getCanvasHeight() * GameScene.CANVAS_ASPECT_RATIO;
  static getCanvasHeight = () => window.innerHeight - APP_BAR_HEIGHT;
}
