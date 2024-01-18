import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { UserInputCursor } from "@/models/dungeons/battle/UI/menu/UserInputCursor";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { dayjs } from "@/services/dayjs";
import { animateText } from "@/services/dungeons/animation/animateText";
import { type GameObjects, type Scene } from "phaser";

export class InfoPanel {
  scene: Scene;
  battleLine1PhaserTextGameObject: GameObjects.Text;
  userInputCursor: UserInputCursor;
  queuedMessages: string[] = [];
  isQueuedMessagesSkipAnimation = false;
  isQueuedMessagesAnimationPlaying = false;
  queuedOnComplete?: () => void;
  isWaitingForPlayerSpecialInput = false;

  constructor(scene: Scene, battleLine1PhaserTextGameObject: GameObjects.Text) {
    this.scene = scene;
    this.battleLine1PhaserTextGameObject = battleLine1PhaserTextGameObject;
    this.userInputCursor = new UserInputCursor(this.scene, this.battleLine1PhaserTextGameObject);
  }

  updateAndShowMessage(messages: string[], onComplete?: () => void, isSkipAnimation = false) {
    this.queuedMessages = messages;
    this.isQueuedMessagesSkipAnimation = isSkipAnimation;
    this.queuedOnComplete = onComplete;
    this.showMessage();
  }

  showMessage() {
    BattleSceneStore.activeBattleMenu = ActiveBattleMenu.Info;
    this.isWaitingForPlayerSpecialInput = false;
    this.battleLine1PhaserTextGameObject.setText("").setVisible(true);
    this.userInputCursor.hide();

    const displayMessage = this.queuedMessages.shift();
    if (!displayMessage) {
      if (this.queuedOnComplete) {
        this.queuedOnComplete();
        this.queuedOnComplete = undefined;
      }
      return;
    }

    if (this.isQueuedMessagesSkipAnimation) {
      this.battleLine1PhaserTextGameObject.setText(displayMessage);
      this.isWaitingForPlayerSpecialInput = true;
      return;
    }

    this.isQueuedMessagesAnimationPlaying = true;
    animateText(this.scene, this.battleLine1PhaserTextGameObject, displayMessage, {
      delay: dayjs.duration(50, "milliseconds").asMilliseconds(),
      onComplete: () => {
        this.userInputCursor.playAnimation();
        this.isWaitingForPlayerSpecialInput = true;
        this.isQueuedMessagesAnimationPlaying = false;
      },
    });
  }

  showMessageNoInputRequired(message: string, onComplete?: () => void, isSkipAnimation?: true) {
    BattleSceneStore.activeBattleMenu = ActiveBattleMenu.Info;
    this.battleLine1PhaserTextGameObject.setText("").setVisible(true);

    if (isSkipAnimation) {
      this.battleLine1PhaserTextGameObject.setText(message);
      onComplete?.();
      return;
    }

    animateText(this.scene, this.battleLine1PhaserTextGameObject, message, {
      delay: dayjs.duration(50, "milliseconds").asMilliseconds(),
      onComplete,
    });
  }
}
