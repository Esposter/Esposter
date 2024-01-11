import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { PlayerBattleMenuOptions } from "@/models/dungeons/PlayerBattleMenuOptions";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { BLANK_VALUE } from "@/services/dungeons/constants";
import { type Direction } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class BattleMenu {
  scene: Scene;
  battleTextGameObjectLine1: GameObjects.Text;
  battleTextGameObjectLine2: GameObjects.Text;
  playerBattleMenuPhaserContainerGameObject: GameObjects.Container;
  monsterBattleMenuPhaserContainerGameObject: GameObjects.Container;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createMainInfoPane();
    this.battleTextGameObjectLine1 = this.scene.add.text(20, 468, "What should", battleUITextStyle);
    // @TODO: Dynamically populate monster name
    this.battleTextGameObjectLine2 = this.scene.add.text(
      20,
      512,
      `${TextureManagerKey.Iguanignite} do next?`,
      battleUITextStyle,
    );
    this.playerBattleMenuPhaserContainerGameObject = this.createPlayerBattleMenu();
    this.monsterBattleMenuPhaserContainerGameObject = this.createMonsterBattleMenu();
    this.hidePlayerBattleMenu();
    this.hideMonsterBattleMenu();
  }

  handlePlayerInput(input: "OK" | "CANCEL" | Direction) {
    if (input === "CANCEL") {
      this.hideMonsterBattleMenu();
      this.showPlayerBattleMenu();
      return;
    }

    this.showMonsterBattleMenu();
    this.hidePlayerBattleMenu();
  }

  showPlayerBattleMenu() {
    this.playerBattleMenuPhaserContainerGameObject.setVisible(true);
    this.battleTextGameObjectLine1.setVisible(true);
    this.battleTextGameObjectLine2.setVisible(true);
  }

  hidePlayerBattleMenu() {
    this.playerBattleMenuPhaserContainerGameObject.setVisible(false);
    this.battleTextGameObjectLine1.setVisible(false);
    this.battleTextGameObjectLine2.setVisible(false);
  }

  showMonsterBattleMenu() {
    this.monsterBattleMenuPhaserContainerGameObject.setVisible(true);
  }

  hideMonsterBattleMenu() {
    this.monsterBattleMenuPhaserContainerGameObject.setVisible(false);
  }

  createMainInfoPane() {
    const padding = 4;
    const height = 124;
    return this.scene.add
      .rectangle(
        padding,
        this.scene.scale.height - height - padding,
        this.scene.scale.width - padding * 2,
        height,
        0xede4f3,
        1,
      )
      .setOrigin(0)
      .setStrokeStyle(padding * 2, 0xe4434a, 1);
  }

  createMainInfoSubPane() {
    const padding = 4;
    const width = 500;
    const height = 124;
    return this.scene.add
      .rectangle(0, 0, width, height, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(padding * 2, 0x905ac2, 1);
  }

  createPlayerBattleMenu() {
    return this.scene.add.container(520, 448, [
      this.createMainInfoSubPane(),
      this.scene.add.text(55, 22, PlayerBattleMenuOptions.Fight, battleUITextStyle),
      this.scene.add.text(240, 22, PlayerBattleMenuOptions.Switch, battleUITextStyle),
      this.scene.add.text(55, 70, PlayerBattleMenuOptions.Item, battleUITextStyle),
      this.scene.add.text(240, 70, PlayerBattleMenuOptions.Flee, battleUITextStyle),
    ]);
  }

  createMonsterBattleMenu() {
    return this.scene.add.container(0, 448, [
      // @TODO: Dynamically populate this based on monster
      this.scene.add.text(55, 22, "Slash", battleUITextStyle),
      this.scene.add.text(240, 22, "Growl", battleUITextStyle),
      this.scene.add.text(55, 70, BLANK_VALUE, battleUITextStyle),
      this.scene.add.text(240, 70, BLANK_VALUE, battleUITextStyle),
    ]);
  }
}
