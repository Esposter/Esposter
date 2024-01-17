import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { Cursor } from "@/models/dungeons/battle/UI/menu/Cursor";
import { InfoPanel } from "@/models/dungeons/battle/UI/menu/InfoPanel";
import { type PlayerBattleSubMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleSubMenuOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { CursorPositionMap } from "@/services/dungeons/battle/UI/menu/CursorPositionMap";
import { getPlayerBattleSubMenuOptionGrid } from "@/services/dungeons/battle/UI/menu/getPlayerBattleSubMenuOptionGrid";
import { BLANK_VALUE } from "@/services/dungeons/constants";
import { type GameObjects, type Scene } from "phaser";

export class BattleSubMenu {
  scene: Scene;
  playerBattleSubMenuOptionCursor: Cursor<PlayerBattleSubMenuOption>;
  battleSubMenuPhaserContainerGameObject: GameObjects.Container;
  battleLine1PhaserTextGameObject: GameObjects.Text;
  battleLine2PhaserTextGameObject: GameObjects.Text;
  infoPanel: InfoPanel;

  constructor(scene: Scene) {
    this.scene = scene;
    this.playerBattleSubMenuOptionCursor = new Cursor(
      this.scene,
      CursorPositionMap,
      getPlayerBattleSubMenuOptionGrid(this.getAttackNames()),
    );
    this.battleSubMenuPhaserContainerGameObject = this.createBattleSubMenu();
    this.battleSubMenuPhaserContainerGameObject.add(this.playerBattleSubMenuOptionCursor.phaserImageGameObject);
    this.battleLine1PhaserTextGameObject = this.scene.add.text(20, 468, "What should", battleUITextStyle);
    this.battleLine2PhaserTextGameObject = this.scene.add.text(
      20,
      512,
      `${BattleSceneStore.activePlayerMonster.name} do next?`,
      battleUITextStyle,
    );
    this.infoPanel = new InfoPanel(this.battleLine1PhaserTextGameObject, this.battleLine2PhaserTextGameObject);
    this.hideBattleSubMenu();
  }

  onChoosePlayerBattleSubMenuOption() {
    this.hideBattleSubMenu();
    BattleSceneStore.battleStateMachine.setState(StateName.EnemyInput);
  }

  showBattleSubMenu() {
    BattleSceneStore.activeBattleMenu = ActiveBattleMenu.Sub;
    this.playerBattleSubMenuOptionCursor.gridPosition = [0, 0];
    this.battleSubMenuPhaserContainerGameObject.setVisible(true);
  }

  hideBattleSubMenu() {
    this.battleSubMenuPhaserContainerGameObject.setVisible(false);
  }

  createBattleSubMenu() {
    const attackNames = this.getAttackNames();
    return this.scene.add.container(0, 448, [
      this.scene.add.text(55, 22, attackNames[0], battleUITextStyle),
      this.scene.add.text(240, 22, attackNames[1], battleUITextStyle),
      this.scene.add.text(55, 70, attackNames[2], battleUITextStyle),
      this.scene.add.text(240, 70, attackNames[3], battleUITextStyle),
    ]);
  }

  private getAttackNames(): PlayerBattleSubMenuOption[] {
    const attackNames: PlayerBattleSubMenuOption[] = [];
    for (let i = 0; i < 4; i++) attackNames.push(BattleSceneStore.activePlayerMonster.attacks[i]?.name || BLANK_VALUE);
    return attackNames;
  }
}
