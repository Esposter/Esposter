import { usePhaserStore } from "~/lib/phaser/store/phaser";
import { ActivePanel } from "~/models/dungeons/battle/UI/menu/ActivePanel";
import { animateText } from "~/services/dungeons/animation/animateText";
import { useBattleSceneStore } from "~/store/dungeons/scene/battle";
import { usePlayerStore } from "~/store/dungeons/scene/battle/player";

export const useInfoPanelStore = defineStore("dungeons/scene/battle/infoPanel", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const battleSceneStore = useBattleSceneStore();
  const { activePanel, isWaitingForPlayerSpecialInput } = storeToRefs(battleSceneStore);
  const playerStore = usePlayerStore();
  const { activeMonster } = storeToRefs(playerStore);
  const line1Text = ref("What should");
  const line2Text = ref(`${activeMonster.value.name} do next?`);
  const isPlayerInputPromptCursorVisible = ref(false);
  const queuedMessages = ref<string[]>([]);
  const queuedOnComplete = ref<() => void>();
  const isQueuedMessagesSkipAnimation = ref(false);
  const isQueuedMessagesAnimationPlaying = ref(false);

  const updateQueuedMessagesAndShowMessage = (messages: string[], onComplete?: () => void, isSkipAnimation = false) => {
    queuedMessages.value = messages;
    queuedOnComplete.value = onComplete;
    isQueuedMessagesSkipAnimation.value = isSkipAnimation;
    showMessage();
  };

  const showMessage = () => {
    activePanel.value = ActivePanel.Info;
    isWaitingForPlayerSpecialInput.value = false;
    isPlayerInputPromptCursorVisible.value = false;
    line1Text.value = "";

    const message = queuedMessages.value.shift();
    if (!message) {
      queuedOnComplete.value?.();
      queuedOnComplete.value = undefined;
      return;
    }

    if (isQueuedMessagesSkipAnimation.value) {
      line1Text.value = message;
      isWaitingForPlayerSpecialInput.value = true;
      return;
    }

    isQueuedMessagesAnimationPlaying.value = true;
    animateText(scene.value, line1Text, message, {
      onComplete: () => {
        isPlayerInputPromptCursorVisible.value = true;
        isWaitingForPlayerSpecialInput.value = true;
        isQueuedMessagesAnimationPlaying.value = false;
      },
    });
  };

  const showMessageNoInputRequired = (message: string, onComplete?: () => void, isSkipAnimation?: true) => {
    activePanel.value = ActivePanel.Info;
    line1Text.value = "";

    if (isSkipAnimation) {
      line1Text.value = message;
      onComplete?.();
      return;
    }

    animateText(scene.value, line1Text, message, { onComplete });
  };

  return {
    line1Text,
    line2Text,
    isPlayerInputPromptCursorVisible,
    updateQueuedMessagesAndShowMessage,
    showMessage,
    showMessageNoInputRequired,
  };
});
