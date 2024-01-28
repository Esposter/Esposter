import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { ActivePanel } from "@/models/dungeons/battle/UI/menu/ActivePanel";
import { Cursor } from "@/models/dungeons/battle/UI/menu/Cursor";
import { InfoPanel } from "@/models/dungeons/battle/UI/menu/InfoPanel";
import { type PlayerAttackOption } from "@/models/dungeons/battle/UI/menu/PlayerAttackOption";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { CursorPositionMap } from "@/services/dungeons/battle/UI/menu/CursorPositionMap";
import { getPlayerAttackOptionGrid } from "@/services/dungeons/battle/UI/menu/getPlayerAttackOptionGrid";
import { BLANK_VALUE } from "@/services/dungeons/constants";
import { type GameObjects, type Scene } from "phaser";

export class BattleSubMenu {
  scene: Scene;
  PlayerAttackOptionCursor: Cursor<PlayerAttackOption>;
  battleSubMenuPhaserContainerGameObject: GameObjects.Container;
  battleLine1PhaserTextGameObject: GameObjects.Text;
  battleLine2PhaserTextGameObject: GameObjects.Text;
  infoPanel: InfoPanel;

  constructor(scene: Scene) {
    this.scene = scene;
    this.PlayerAttackOptionCursor = new Cursor(
      this.scene,
      CursorPositionMap,
      getPlayerAttackOptionGrid(this.getAttackNames()),
    );
    this.battleSubMenuPhaserContainerGameObject = this.createBattleSubMenu();
    this.battleSubMenuPhaserContainerGameObject.add(this.PlayerAttackOptionCursor.phaserImageGameObject);
    this.battleLine1PhaserTextGameObject = this.scene.add.text(20, 468, "What should", battleUITextStyle);
    this.battleLine2PhaserTextGameObject = this.scene.add.text(
      20,
      512,
      `${BattleSceneStore.activePlayerMonster.name} do next?`,
      battleUITextStyle,
    );
    this.infoPanel = new InfoPanel(this.scene, this.battleLine1PhaserTextGameObject);
    this.hideBattleSubMenu();
  }

  onChoosePlayerAttackOption() {
    this.hideBattleSubMenu();
    BattleSceneStore.battleStateMachine.setState(StateName.EnemyInput);
  }

  showBattleSubMenu() {
    BattleSceneStore.activePanel = ActivePanel.Sub;
    this.PlayerAttackOptionCursor.gridPosition = [0, 0];
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

  private getAttackNames(): PlayerAttackOption[] {
    const attackNames: PlayerAttackOption[] = [];
    for (let i = 0; i < 4; i++) attackNames.push(BattleSceneStore.activePlayerMonster.attacks[i]?.name || BLANK_VALUE);
    return attackNames;
  }
}
