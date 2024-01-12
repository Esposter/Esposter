import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import { Grid } from "@/models/dungeons/Grid";
import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { PlayerBattleSubMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleSubMenuOption";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { BattleMenuStore } from "@/models/dungeons/store/BattleMenuStore";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { type GameObjects, type Scene } from "phaser";

export class BattleSubMenu {
  scene: Scene;
  battleTextGameObjectLine1: GameObjects.Text;
  battleTextGameObjectLine2: GameObjects.Text;
  cursorPhaserImageGameObject: GameObjects.Image;
  battleSubMenuPhaserContainerGameObject: GameObjects.Container;
  playerBattleSubMenuOptionGrid: Grid<PlayerBattleSubMenuOption>;

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
    this.playerBattleSubMenuOptionGrid = new Grid(
      [
        [PlayerBattleSubMenuOption.Move1, PlayerBattleSubMenuOption.Move2],
        [PlayerBattleSubMenuOption.Move3, PlayerBattleSubMenuOption.Move4],
      ],
      2,
    );
    this.hideBattleSubMenu();
  }

  updateCursorPosition() {
    switch (this.playerBattleSubMenuOptionGrid.value) {
      case PlayerBattleSubMenuOption.Move1:
        this.cursorPhaserImageGameObject.setPosition(INITIAL_CURSOR_POSITION.x, INITIAL_CURSOR_POSITION.y);
        return;
      case PlayerBattleSubMenuOption.Move2:
        this.cursorPhaserImageGameObject.setPosition(228, INITIAL_CURSOR_POSITION.y);
        return;
      case PlayerBattleSubMenuOption.Move3:
        this.cursorPhaserImageGameObject.setPosition(INITIAL_CURSOR_POSITION.x, 86);
        return;
      case PlayerBattleSubMenuOption.Move4:
        this.cursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.playerBattleSubMenuOptionGrid.value);
    }
  }

  showBattleSubMenu() {
    BattleMenuStore.activeBattleMenu = ActiveBattleMenu.Sub;
    this.playerBattleSubMenuOptionGrid.position = [0, 0];
    this.cursorPhaserImageGameObject.setPosition(INITIAL_CURSOR_POSITION.x, INITIAL_CURSOR_POSITION.y);
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
