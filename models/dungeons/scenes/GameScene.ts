import { SceneWithPlugins } from "@/models/dungeons/SceneWithPlugins";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpriteKey } from "@/models/dungeons/keys/SpriteKey";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { TilesetName } from "@/models/dungeons/keys/TilesetName";
import { JoystickMovementManager } from "@/models/dungeons/managers/JoystickMovementManager";
import { KeyboardMovementManager } from "@/models/dungeons/managers/KeyboardMovementManager";
import { type MovementManager } from "@/models/dungeons/managers/MovementManager";
import isMobile from "is-mobile";
import { type GameObjects } from "phaser";

export class GameScene extends SceneWithPlugins {
  movementManager!: MovementManager;
  playerSprite!: GameObjects.Sprite;

  constructor() {
    super(SceneKey.Game);
  }

  create() {
    this.movementManager = isMobile()
      ? new JoystickMovementManager(this.gridEngine, this, this.virtualJoystickPlugin)
      : new KeyboardMovementManager(this.gridEngine, this);
    this.addPlayerSprite();
    this.addMap();
    this.cameras.main.startFollow(this.playerSprite, true);
    this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);
  }

  update() {
    this.movementManager.moveSprite(SpriteKey.Player);
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
