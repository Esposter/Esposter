import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpriteKey } from "@/models/dungeons/keys/SpriteKey";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { TilesetName } from "@/models/dungeons/keys/TilesetName";
import { JoystickManager } from "@/models/dungeons/managers/JoystickManager";
import { MovementManager } from "@/models/dungeons/managers/MovementManager";
import { addJoystick } from "@/services/dungeons/joystick/addJoystick";
import { type GridEngine } from "grid-engine";
import isMobile from "is-mobile";
import { Scene, type GameObjects } from "phaser";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export class GameScene extends Scene {
  movementManager!: MovementManager;
  joystickManager: JoystickManager | null = null;
  playerSprite!: GameObjects.Sprite;
  gridEngine!: GridEngine;
  rexVirtualJoystick!: VirtualJoystickPlugin;

  constructor() {
    super(SceneKey.Game);
  }

  create() {
    this.movementManager = new MovementManager(this.gridEngine);
    this.addPlayerSprite();
    this.addMap();

    if (isMobile()) {
      const joystick = addJoystick(this, this.rexVirtualJoystick);
      this.joystickManager = new JoystickManager(joystick, this);
    }

    this.cameras.main.startFollow(this.playerSprite, true);
    this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);
  }

  update() {
    if (this.joystickManager) this.movementManager.move(SpriteKey.Player, this.joystickManager.createCursorKeys());
    else if (this.input.keyboard) this.movementManager.move(SpriteKey.Player, this.input.keyboard.createCursorKeys());
  }

  addPlayerSprite = () => {
    this.playerSprite = this.add.sprite(0, 0, SpritesheetKey.Characters);
    this.playerSprite.scale = 1.5;
  };

  addMap = () => {
    const cloudCityTilemap = this.make.tilemap({ key: TilemapKey.CloudCity });
    cloudCityTilemap.addTilesetImage(TilesetName["Cloud City"], TilesetKey.CloudCity);

    for (let i = 0; i < cloudCityTilemap.layers.length; i++) {
      const layer = cloudCityTilemap.createLayer(i, TilesetName["Cloud City"], 0, 0);
      if (!layer) continue;
      layer.scale = 3;
    }

    this.gridEngine.create(cloudCityTilemap, {
      characters: [
        {
          id: SpriteKey.Player,
          sprite: this.playerSprite,
          walkingAnimationMapping: 6,
          startPosition: { x: 8, y: 8 },
        },
      ],
      numberOfDirections: 8,
    });
  };
}
