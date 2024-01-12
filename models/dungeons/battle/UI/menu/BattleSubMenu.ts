import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { Cursor } from "@/models/dungeons/battle/UI/menu/Cursor";
import { InfoPanel } from "@/models/dungeons/battle/UI/menu/InfoPanel";
import { PlayerBattleSubMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleSubMenuOption";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { BattleMenuStore } from "@/models/dungeons/store/BattleMenuStore";
import { PlayerBattleSubMenuOptionCursorPositionMap } from "@/services/dungeons/battle/UI/menu/PlayerBattleSubMenuOptionCursorPositionMap";
import { PlayerBattleSubMenuOptionGrid } from "@/services/dungeons/battle/UI/menu/PlayerBattleSubMenuOptionGrid";
import { type GameObjects, type Scene } from "phaser";

export class BattleSubMenu {
  scene: Scene;
  battleSubMenuPhaserContainerGameObject: GameObjects.Container;
  cursor: Cursor<PlayerBattleSubMenuOption>;
  battleTextGameObjectLine1: GameObjects.Text;
  battleTextGameObjectLine2: GameObjects.Text;
  infoPanel: InfoPanel;

  constructor(scene: Scene) {
    this.scene = scene;
    this.cursor = new Cursor(this.scene, PlayerBattleSubMenuOptionCursorPositionMap, PlayerBattleSubMenuOptionGrid);
    this.battleSubMenuPhaserContainerGameObject = this.createBattleSubMenu();
    this.battleSubMenuPhaserContainerGameObject.add(this.cursor.phaserImageGameObject);
    this.battleTextGameObjectLine1 = this.scene.add.text(20, 468, "What should", battleUITextStyle);
    // @TODO: Dynamically populate monster name
    this.battleTextGameObjectLine2 = this.scene.add.text(
      20,
      512,
      `${TextureManagerKey.Iguanignite} do next?`,
      battleUITextStyle,
    );
    this.infoPanel = new InfoPanel(this.battleTextGameObjectLine1);
    this.hideBattleSubMenu();
  }

  showBattleSubMenu() {
    BattleMenuStore.activeBattleMenu = ActiveBattleMenu.Sub;
    this.cursor.gridPosition = [0, 0];
    this.battleSubMenuPhaserContainerGameObject.setVisible(true);
  }

  hideBattleSubMenu() {
    this.battleSubMenuPhaserContainerGameObject.setVisible(false);
  }

  createBattleSubMenu() {
    return this.scene.add.container(0, 448, [
      // @TODO: Dynamically populate this based on monster
      this.scene.add.text(55, 22, PlayerBattleSubMenuOption.Move1, battleUITextStyle),
      this.scene.add.text(240, 22, PlayerBattleSubMenuOption.Move2, battleUITextStyle),
      this.scene.add.text(55, 70, PlayerBattleSubMenuOption.Move3, battleUITextStyle),
      this.scene.add.text(240, 70, PlayerBattleSubMenuOption.Move4, battleUITextStyle),
    ]);
  }
}
