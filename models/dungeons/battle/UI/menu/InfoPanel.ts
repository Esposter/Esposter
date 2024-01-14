import { type GameObjects } from "phaser";

export class InfoPanel {
  battleLine1PhaserTextGameObject: GameObjects.Text;
  queuedMessages: string[] = [];
  queuedCallback?: () => void;
  isWaitingForPlayerSpecialInput = false;

  constructor(battleLine1PhaserTextGameObject: GameObjects.Text) {
    this.battleLine1PhaserTextGameObject = battleLine1PhaserTextGameObject;
  }

  updateAndShowMessage(messages: string[], callback?: () => void) {
    this.queuedMessages = messages;
    this.queuedCallback = callback;
    this.showMessage();
  }

  showMessage() {
    this.isWaitingForPlayerSpecialInput = false;
    this.battleLine1PhaserTextGameObject.setText("").setVisible(true);

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
  }
}
