import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { PLAYER_SPECIAL_INPUT_PROMPT } from "@/services/dungeons/constants";
import { type GameObjects } from "phaser";

export class InfoPanel {
  battleLine1PhaserTextGameObject: GameObjects.Text;
  battleLine2PhaserTextGameObject: GameObjects.Text;
  queuedMessages: string[] = [];
  queuedCallback?: () => void;
  isWaitingForPlayerSpecialInput = false;

  constructor(battleLine1PhaserTextGameObject: GameObjects.Text, battleLine2PhaserTextGameObject: GameObjects.Text) {
    this.battleLine1PhaserTextGameObject = battleLine1PhaserTextGameObject;
    this.battleLine2PhaserTextGameObject = battleLine2PhaserTextGameObject;
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
    this.battleLine2PhaserTextGameObject.setText("").setVisible(true);

    const displayMessage = this.queuedMessages.shift();
    if (!displayMessage) {
      if (this.queuedCallback) {
        this.queuedCallback();
        this.queuedCallback = undefined;
      }
      return;
    }

    this.battleLine1PhaserTextGameObject.setText(displayMessage);
    this.battleLine2PhaserTextGameObject.setText(PLAYER_SPECIAL_INPUT_PROMPT);
    this.isWaitingForPlayerSpecialInput = true;
  }
}
