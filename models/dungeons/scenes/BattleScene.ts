import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { PlayerBattleMenuOptions } from "@/models/dungeons/PlayerBattleMenuOptions";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { BLANK_VALUE } from "@/services/dungeons/constants";
import { Scene } from "phaser";

export class BattleScene extends Scene {
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

    this.createMainInfoPane();
    this.add.container(520, 448, [
      this.createMainInfoSubPane(),
      this.add.text(55, 22, PlayerBattleMenuOptions.Fight, battleUITextStyle),
      this.add.text(240, 22, PlayerBattleMenuOptions.Switch, battleUITextStyle),
      this.add.text(55, 70, PlayerBattleMenuOptions.Item, battleUITextStyle),
      this.add.text(240, 70, PlayerBattleMenuOptions.Flee, battleUITextStyle),
    ]);

    this.add.container(0, 448, [
      // @TODO: dynamically populate this based on monster
      this.add.text(55, 22, "Slash", battleUITextStyle),
      this.add.text(240, 22, "Growl", battleUITextStyle),
      this.add.text(55, 70, BLANK_VALUE, battleUITextStyle),
      this.add.text(240, 70, BLANK_VALUE, battleUITextStyle),
    ]);
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

  createMainInfoPane() {
    const padding = 4;
    const height = 124;
    this.add
      .rectangle(padding, this.scale.height - height - padding, this.scale.width - padding * 2, height, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(padding * 2, 0xe4434a, 1);
  }

  createMainInfoSubPane() {
    const padding = 4;
    const width = 500;
    const height = 124;
    return this.add
      .rectangle(0, 0, width, height, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(padding * 2, 0x905ac2, 1);
  }
}
