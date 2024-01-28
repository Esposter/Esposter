import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { ActivePanel } from "@/models/dungeons/battle/UI/menu/ActivePanel";
import { BattleSubMenu } from "@/models/dungeons/battle/UI/menu/BattleSubMenu";
import { Cursor } from "@/models/dungeons/battle/UI/menu/Cursor";
import { PlayerOption } from "@/models/dungeons/battle/UI/menu/PlayerOption";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { CursorPositionMap } from "@/services/dungeons/battle/UI/menu/CursorPositionMap";
import { PlayerOptionGrid } from "@/services/dungeons/battle/UI/menu/PlayerOptionGrid";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { Direction } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class BattleMenu {
  scene: Scene;
  PlayerOptionCursor: Cursor<PlayerOption>;
  playerBattleMenuPhaserContainerGameObject: GameObjects.Container;
  battleSubMenu: BattleSubMenu;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createMainInfoPanel();
    this.PlayerOptionCursor = new Cursor(this.scene, CursorPositionMap, PlayerOptionGrid);
    this.playerBattleMenuPhaserContainerGameObject = this.createPlayerBattleMenu();
    this.playerBattleMenuPhaserContainerGameObject.add(this.PlayerOptionCursor.phaserImageGameObject);
    this.battleSubMenu = new BattleSubMenu(scene);
    this.hidePlayerBattleMenu();
  }

  onPlayerInput(input: PlayerSpecialInput | Direction) {
    // These are all the states that use updateAndShowMessage
    const playerConfirmShowNextMessageStates: (StateName | null)[] = [
      StateName.PreBattleInfo,
      StateName.PlayerInput,
      StateName.PlayerPostAttackCheck,
      StateName.EnemyPostAttackCheck,
      StateName.FleeAttempt,
    ];
    if (!playerConfirmShowNextMessageStates.includes(BattleSceneStore.battleStateMachine.currentStateName)) return;
    // Check if we're trying to show messages
    if (input === PlayerSpecialInput.Confirm)
      if (this.battleSubMenu.infoPanel.isQueuedMessagesAnimationPlaying) return;
      else if (this.battleSubMenu.infoPanel.isWaitingForPlayerSpecialInput) {
        this.battleSubMenu.infoPanel.showMessage();
        return;
      }
    // From here on we only have the player input state to handle
    if (BattleSceneStore.battleStateMachine.currentStateName !== StateName.PlayerInput) return;

    if (isPlayerSpecialInput(input)) this.onPlayerSpecialInput(input);
    else this.onPlayerDirectionInput(input);
  }

  onPlayerSpecialInput(playerSpecialInput: PlayerSpecialInput) {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (BattleSceneStore.activePanel === ActivePanel.Main) this.onChoosePlayerOption();
        else if (BattleSceneStore.activePanel === ActivePanel.Sub) this.battleSubMenu.onChoosePlayerAttackOption();
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
        if (BattleSceneStore.activePanel === ActivePanel.Main) this.PlayerOptionCursor.moveGridPosition(direction);
        else if (BattleSceneStore.activePanel === ActivePanel.Sub)
          this.battleSubMenu.PlayerAttackOptionCursor.moveGridPosition(direction);
    }
  }

  onChoosePlayerOption() {
    this.hidePlayerBattleMenu();

    switch (this.PlayerOptionCursor.activeOption) {
      case PlayerOption.Fight:
        this.battleSubMenu.showBattleSubMenu();
        return;
      case PlayerOption.Switch:
        this.battleSubMenu.infoPanel.updateAndShowMessage(["You have no other monsters in your party..."], () => {
          this.switchToPlayerBattleMenu();
        });
        return;
      case PlayerOption.Item:
        this.battleSubMenu.infoPanel.updateAndShowMessage(["Your bag is empty..."], () => {
          this.switchToPlayerBattleMenu();
        });
        return;
      case PlayerOption.Flee:
        BattleSceneStore.battleStateMachine.setState(StateName.FleeAttempt);
        return;
      default:
        exhaustiveGuard(this.PlayerOptionCursor.activeOption);
    }
  }

  switchToPlayerBattleMenu() {
    this.battleSubMenu.hideBattleSubMenu();
    this.showPlayerBattleMenu();
  }

  showPlayerBattleMenu() {
    BattleSceneStore.activePanel = ActivePanel.Main;
    this.PlayerOptionCursor.gridPosition = [0, 0];
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
      this.scene.add.text(55, 22, PlayerOption.Fight, battleUITextStyle),
      this.scene.add.text(240, 22, PlayerOption.Switch, battleUITextStyle),
      this.scene.add.text(55, 70, PlayerOption.Item, battleUITextStyle),
      this.scene.add.text(240, 70, PlayerOption.Flee, battleUITextStyle),
    ]);
  }
}
