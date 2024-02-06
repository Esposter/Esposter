import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpriteKey } from "@/models/dungeons/keys/SpriteKey";
import { JoystickMovementManager } from "@/models/dungeons/manager/JoystickMovementManager";
import { KeyboardMovementManager } from "@/models/dungeons/manager/KeyboardMovementManager";
import { type MovementManager } from "@/models/dungeons/manager/MovementManager";
import { SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
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
    this.cameras.main.startFollow(this.playerSprite, true);
    this.cameras.main.setFollowOffset(-this.playerSprite.width, -this.playerSprite.height);
  }

  update() {
    this.movementManager.moveSprite(SpriteKey.Player);
  }
}
