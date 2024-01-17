import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { BattleSubMenu } from "@/models/dungeons/battle/UI/menu/BattleSubMenu";
import { Cursor } from "@/models/dungeons/battle/UI/menu/Cursor";
import { PlayerBattleMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleMenuOption";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { CursorPositionMap } from "@/services/dungeons/battle/UI/menu/CursorPositionMap";
import { PlayerBattleMenuOptionGrid } from "@/services/dungeons/battle/UI/menu/PlayerBattleMenuOptionGrid";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { Direction } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class BattleMenu {
  scene: Scene;
  playerBattleMenuOptionCursor: Cursor<PlayerBattleMenuOption>;
  playerBattleMenuPhaserContainerGameObject: GameObjects.Container;
  battleSubMenu: BattleSubMenu;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createMainInfoPanel();
    this.playerBattleMenuOptionCursor = new Cursor(this.scene, CursorPositionMap, PlayerBattleMenuOptionGrid);
    this.playerBattleMenuPhaserContainerGameObject = this.createPlayerBattleMenu();
    this.playerBattleMenuPhaserContainerGameObject.add(this.playerBattleMenuOptionCursor.phaserImageGameObject);
    this.battleSubMenu = new BattleSubMenu(scene);
    this.hidePlayerBattleMenu();
  }

  onPlayerInput(input: PlayerSpecialInput | Direction) {
    if (isPlayerSpecialInput(input)) this.onPlayerSpecialInput(input);
    else this.onPlayerDirectionInput(input);
  }

  onPlayerSpecialInput(playerSpecialInput: PlayerSpecialInput) {
    if (this.battleSubMenu.infoPanel.isWaitingForPlayerSpecialInput) {
      this.battleSubMenu.infoPanel.showMessage();
      return;
    }

    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (BattleSceneStore.activeBattleMenu === ActiveBattleMenu.Main) this.onChoosePlayerBattleMenuOption();
        else if (BattleSceneStore.activeBattleMenu === ActiveBattleMenu.Sub)
          this.battleSubMenu.onChoosePlayerBattleSubMenuOption();
        return;
      case PlayerSpecialInput.Cancel:
        this.switchToPlayerBattleMenu();
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  }

  onPlayerDirectionInput(direction: Direction) {
    switch (direction) {
      case Direction.NONE:
        return;
      default:
        if (BattleSceneStore.activeBattleMenu === ActiveBattleMenu.Main)
          this.playerBattleMenuOptionCursor.moveGridPosition(direction);
        else if (BattleSceneStore.activeBattleMenu === ActiveBattleMenu.Sub)
          this.battleSubMenu.playerBattleSubMenuOptionCursor.moveGridPosition(direction);
    }
  }

  onChoosePlayerBattleMenuOption() {
    this.hidePlayerBattleMenu();

    switch (this.playerBattleMenuOptionCursor.activeOption) {
      case PlayerBattleMenuOption.Fight:
        this.battleSubMenu.showBattleSubMenu();
        return;
      case PlayerBattleMenuOption.Switch:
        this.battleSubMenu.infoPanel.updateAndShowMessage(["You have no other monsters in your party..."], () => {
          this.switchToPlayerBattleMenu();
        });
        return;
      case PlayerBattleMenuOption.Item:
        this.battleSubMenu.infoPanel.updateAndShowMessage(["Your bag is empty..."], () => {
          this.switchToPlayerBattleMenu();
        });
        return;
      case PlayerBattleMenuOption.Flee:
        BattleSceneStore.battleStateMachine.setState(StateName.FleeAttempt);
        return;
      default:
        exhaustiveGuard(this.playerBattleMenuOptionCursor.activeOption);
    }
  }

  switchToPlayerBattleMenu() {
    this.battleSubMenu.hideBattleSubMenu();
    this.showPlayerBattleMenu();
  }

  showPlayerBattleMenu() {
    BattleSceneStore.activeBattleMenu = ActiveBattleMenu.Main;
    this.playerBattleMenuOptionCursor.gridPosition = [0, 0];
    this.battleSubMenu.battleLine1PhaserTextGameObject.setText("What should");
    this.battleSubMenu.battleLine2PhaserTextGameObject.setText(`${BattleSceneStore.activePlayerMonster.name} do next?`);
    this.playerBattleMenuPhaserContainerGameObject.setVisible(true);
    this.battleSubMenu.battleLine1PhaserTextGameObject.setVisible(true);
    this.battleSubMenu.battleLine2PhaserTextGameObject.setVisible(true);
  }

  hidePlayerBattleMenu() {
    this.playerBattleMenuPhaserContainerGameObject.setVisible(false);
    this.battleSubMenu.battleLine1PhaserTextGameObject.setVisible(false);
    this.battleSubMenu.battleLine2PhaserTextGameObject.setVisible(false);
  }

  createMainInfoPanel() {
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

  createMainInfoSubPanel() {
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
      this.createMainInfoSubPanel(),
      this.scene.add.text(55, 22, PlayerBattleMenuOption.Fight, battleUITextStyle),
      this.scene.add.text(240, 22, PlayerBattleMenuOption.Switch, battleUITextStyle),
      this.scene.add.text(55, 70, PlayerBattleMenuOption.Item, battleUITextStyle),
      this.scene.add.text(240, 70, PlayerBattleMenuOption.Flee, battleUITextStyle),
    ]);
  }
}
