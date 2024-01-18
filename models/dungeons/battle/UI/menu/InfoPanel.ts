import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { UserInputCursor } from "@/models/dungeons/battle/UI/menu/UserInputCursor";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { type GameObjects, type Scene } from "phaser";

export class InfoPanel {
  scene: Scene;
  battleLine1PhaserTextGameObject: GameObjects.Text;
  userInputCursor: UserInputCursor;
  queuedMessages: string[] = [];
  queuedCallback?: () => void;
  isWaitingForPlayerSpecialInput = false;

  constructor(scene: Scene, battleLine1PhaserTextGameObject: GameObjects.Text) {
    this.scene = scene;
    this.battleLine1PhaserTextGameObject = battleLine1PhaserTextGameObject;
    this.userInputCursor = new UserInputCursor(this.scene, this.battleLine1PhaserTextGameObject);
  }

  updateAndShowMessage(messages: string[], callback?: () => void) {
    this.queuedMessages = messages;
    this.queuedCallback = callback;
    this.showMessage();
  }

  showMessage() {
    BattleSceneStore.activeBattleMenu = ActiveBattleMenu.Info;
    this.isWaitingForPlayerSpecialInput = false;
    this.battleLine1PhaserTextGameObject.setText("").setVisible(true);
    this.userInputCursor.hide();

    const displayMessage = this.queuedMessages.shift();
    if (!displayMessage) {
      if (this.queuedCallback) {
        this.queuedCallback();
        this.queuedCallback = undefined;
      }
      return;
    }

    this.battleLine1PhaserTextGameObject.setText(displayMessage);
    this.isWaitingForPlayerSpecialInput = true;
    this.userInputCursor.playAnimation();
  }

  showMessageNoInputRequired(message: string, callback?: () => void) {
    BattleSceneStore.activeBattleMenu = ActiveBattleMenu.Info;
    this.battleLine1PhaserTextGameObject.setText("").setVisible(true);
    this.battleLine1PhaserTextGameObject.setText(message);
    callback?.();
  }
}
