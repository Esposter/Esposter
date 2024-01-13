import { SceneWithPlugins } from "@/models/dungeons/SceneWithPlugins";
import { BattleMenu } from "@/models/dungeons/battle/UI/menu/BattleMenu";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { mapCursorKeysToDirection } from "@/services/dungeons/mapCursorKeysToDirection";
import { Input, type Types } from "phaser";
import { PlayerSpecialInput } from "../input/PlayerSpecialInput";

export class BattleScene extends SceneWithPlugins {
  cursorKeys!: Types.Input.Keyboard.CursorKeys;
  battleMenu!: BattleMenu;

  constructor() {
    super(SceneKey.Battle);
  }

  create() {
    this.add.image(0, 0, TextureManagerKey.ForestBackground).setOrigin(0);
    // Player and enemy monsters
    this.add.image(768, 144, TextureManagerKey.Carnodusk, 0);
    this.add.image(256, 316, TextureManagerKey.Iguanignite, 0).setFlipX(true);

    const playerMonsterName = this.add.text(30, 20, TextureManagerKey.Iguanignite, {
      color: "#7e3d3f",
      fontSize: "2rem",
    });
    this.add.container(556, 318, [
      this.add.image(0, 0, TextureManagerKey.HealthBarBackground).setOrigin(0),
      playerMonsterName,
      this.createHealthBar(34, 34),
      this.add.text(playerMonsterName.displayWidth + 35, 23, "L5", {
        color: "#ed474b",
        fontSize: "1.75rem",
      }),
      this.add.text(30, 55, "HP", {
        color: "#ff6505",
        fontSize: "1.5rem",
        fontStyle: "italic",
      }),
      this.add
        .text(443, 80, "25/25", {
          color: "#7e3d3f",
          fontSize: "1rem",
        })
        .setOrigin(1, 0),
    ]);

    const enemyMonsterName = this.add.text(30, 20, TextureManagerKey.Carnodusk, {
      color: "#7e3d3f",
      fontSize: "2rem",
    });
    this.add.container(0, 0, [
      this.add.image(0, 0, TextureManagerKey.HealthBarBackground).setOrigin(0).setScale(1, 0.8),
      enemyMonsterName,
      this.createHealthBar(34, 34),
      this.add.text(enemyMonsterName.displayWidth + 35, 23, "L5", {
        color: "#ed474b",
        fontSize: "1.75rem",
      }),
      this.add.text(30, 55, "HP", {
        color: "#ff6505",
        fontSize: "1.5rem",
        fontStyle: "italic",
      }),
      this.add
        .text(443, 80, "25/25", {
          color: "#7e3d3f",
          fontSize: "1rem",
        })
        .setOrigin(1, 0),
    ]);

    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.battleMenu = new BattleMenu(this);
    this.battleMenu.showPlayerBattleMenu();
  }

  update() {
    if (Input.Keyboard.JustDown(this.cursorKeys.space)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Confirm);
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Cancel);
    else this.battleMenu.onPlayerInput(mapCursorKeysToDirection(this.cursorKeys));
  }

  createHealthBar(x: number, y: number) {
    const scaleY = 0.7;
    // Set origin to the middle-left of the health caps to enable
    // grabbing the full width of the game object
    const leftCap = this.add.image(x, y, TextureManagerKey.HealthBarLeftCap).setOrigin(0, 0.5).setScale(1, scaleY);
    const middle = this.add
      .image(leftCap.x + leftCap.displayWidth, y, TextureManagerKey.HealthBarMiddle)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);
    middle.displayWidth = 360;
    const rightCap = this.add
      .image(middle.x + middle.displayWidth, y, TextureManagerKey.HealthBarRightCap)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);
    return this.add.container(x, y, [leftCap, middle, rightCap]);
  }
}
