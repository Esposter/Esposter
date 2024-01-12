import { type GameObjects } from "phaser";

export class InfoPanel {
  battleTextGameObjectLine1: GameObjects.Text;
  queuedMessages: string[] = [];
  queuedCallback?: () => void;
  isWaitingForPlayerInput = false;

  constructor(battleTextGameObjectLine1: GameObjects.Text) {
    this.battleTextGameObjectLine1 = battleTextGameObjectLine1;
  }

  updateAndShowMessage(messages: string[], callback?: () => void) {
    this.queuedMessages = messages;
    this.queuedCallback = callback;
    this.showMessage();
  }

  showMessage() {
    this.isWaitingForPlayerInput = false;
    this.battleTextGameObjectLine1.setText("").setVisible(true);

    const displayMessage = this.queuedMessages.shift();
    if (!displayMessage) {
      if (this.queuedCallback) {
        this.queuedCallback();
        this.queuedCallback = undefined;
      }
      return;
    }

    this.battleTextGameObjectLine1.setText(displayMessage);
    this.isWaitingForPlayerInput = true;
  }
}
