import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { BLANK_VALUE } from "@/services/dungeons/constants";
import { type GameObjects, type Scene } from "phaser";

export class BattleSubMenu {
  scene: Scene;
  battleTextGameObjectLine1: GameObjects.Text;
  battleTextGameObjectLine2: GameObjects.Text;
  cursorPhaserImageGameObject: GameObjects.Image;
  battleSubMenuPhaserContainerGameObject: GameObjects.Container;

  constructor(scene: Scene) {
    this.scene = scene;
    this.battleTextGameObjectLine1 = this.scene.add.text(20, 468, "What should", battleUITextStyle);
    // @TODO: Dynamically populate monster name
    this.battleTextGameObjectLine2 = this.scene.add.text(
      20,
      512,
      `${TextureManagerKey.Iguanignite} do next?`,
      battleUITextStyle,
    );
    this.cursorPhaserImageGameObject = this.scene.add
      .image(INITIAL_CURSOR_POSITION.x, INITIAL_CURSOR_POSITION.y, TextureManagerKey.Cursor, 0)
      .setOrigin(0.5)
      .setScale(2.5);
    this.battleSubMenuPhaserContainerGameObject = this.createBattleSubMenu();
    this.battleSubMenuPhaserContainerGameObject.add(this.cursorPhaserImageGameObject);
    this.hideBattleSubMenu();
  }

  showBattleSubMenu() {
    this.battleSubMenuPhaserContainerGameObject.setVisible(true);
  }

  hideBattleSubMenu() {
    this.battleSubMenuPhaserContainerGameObject.setVisible(false);
  }

  createBattleSubMenu() {
    return this.scene.add.container(0, 448, [
      // @TODO: Dynamically populate this based on monster
      this.scene.add.text(55, 22, "Slash", battleUITextStyle),
      this.scene.add.text(240, 22, "Growl", battleUITextStyle),
      this.scene.add.text(55, 70, BLANK_VALUE, battleUITextStyle),
      this.scene.add.text(240, 70, BLANK_VALUE, battleUITextStyle),
    ]);
  }
}
