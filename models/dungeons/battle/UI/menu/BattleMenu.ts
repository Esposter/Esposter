import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { Grid } from "@/models/dungeons/Grid";
import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { BattleSubMenu } from "@/models/dungeons/battle/UI/menu/BattleSubMenu";
import { PlayerBattleMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleMenuOption";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { BattleMenuStore } from "@/models/dungeons/store/BattleMenuStore";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { Direction } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class BattleMenu {
  scene: Scene;
  battleSubMenu: BattleSubMenu;
  cursorPhaserImageGameObject: GameObjects.Image;
  playerBattleMenuPhaserContainerGameObject: GameObjects.Container;
  playerBattleMenuOptionGrid: Grid<PlayerBattleMenuOption>;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createMainInfoPane();
    this.cursorPhaserImageGameObject = this.scene.add
      .image(INITIAL_CURSOR_POSITION.x, INITIAL_CURSOR_POSITION.y, TextureManagerKey.Cursor)
      .setOrigin(0.5)
      .setScale(2.5);
    this.playerBattleMenuPhaserContainerGameObject = this.createPlayerBattleMenu();
    this.playerBattleMenuPhaserContainerGameObject.add(this.cursorPhaserImageGameObject);
    this.playerBattleMenuOptionGrid = new Grid(
      [
        [PlayerBattleMenuOption.Fight, PlayerBattleMenuOption.Switch],
        [PlayerBattleMenuOption.Item, PlayerBattleMenuOption.Flee],
      ],
      2,
    );
    this.battleSubMenu = new BattleSubMenu(scene);
    this.hidePlayerBattleMenu();
  }

  onPlayerInput(input: "OK" | "CANCEL" | Direction) {
    switch (input) {
      case "OK":
        this.battleSubMenu.showBattleSubMenu();
        this.hidePlayerBattleMenu();
        return;
      case "CANCEL":
        this.battleSubMenu.hideBattleSubMenu();
        this.showPlayerBattleMenu();
        return;
      case Direction.NONE:
        return;
      default:
        if (BattleMenuStore.activeBattleMenu === ActiveBattleMenu.Main) {
          this.playerBattleMenuOptionGrid.move(input);
          this.updateCursorPosition();
        } else if (BattleMenuStore.activeBattleMenu === ActiveBattleMenu.Sub) {
          this.battleSubMenu.playerBattleSubMenuOptionGrid.move(input);
          this.battleSubMenu.updateCursorPosition();
        }
    }
  }

  updateCursorPosition() {
    switch (this.playerBattleMenuOptionGrid.value) {
      case PlayerBattleMenuOption.Fight:
        this.cursorPhaserImageGameObject.setPosition(INITIAL_CURSOR_POSITION.x, INITIAL_CURSOR_POSITION.y);
        return;
      case PlayerBattleMenuOption.Switch:
        this.cursorPhaserImageGameObject.setPosition(228, INITIAL_CURSOR_POSITION.y);
        return;
      case PlayerBattleMenuOption.Item:
        this.cursorPhaserImageGameObject.setPosition(INITIAL_CURSOR_POSITION.x, 86);
        return;
      case PlayerBattleMenuOption.Flee:
        this.cursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.playerBattleMenuOptionGrid.value);
    }
  }

  showPlayerBattleMenu() {
    BattleMenuStore.activeBattleMenu = ActiveBattleMenu.Main;
    this.playerBattleMenuOptionGrid.position = [0, 0];
    this.cursorPhaserImageGameObject.setPosition(INITIAL_CURSOR_POSITION.x, INITIAL_CURSOR_POSITION.y);
    this.playerBattleMenuPhaserContainerGameObject.setVisible(true);
    this.battleSubMenu.battleTextGameObjectLine1.setVisible(true);
    this.battleSubMenu.battleTextGameObjectLine2.setVisible(true);
  }

  hidePlayerBattleMenu() {
    this.playerBattleMenuPhaserContainerGameObject.setVisible(false);
    this.battleSubMenu.battleTextGameObjectLine1.setVisible(false);
    this.battleSubMenu.battleTextGameObjectLine2.setVisible(false);
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
      this.scene.add.text(55, 22, PlayerBattleMenuOption.Fight, battleUITextStyle),
      this.scene.add.text(240, 22, PlayerBattleMenuOption.Switch, battleUITextStyle),
      this.scene.add.text(55, 70, PlayerBattleMenuOption.Item, battleUITextStyle),
      this.scene.add.text(240, 70, PlayerBattleMenuOption.Flee, battleUITextStyle),
    ]);
  }
}
