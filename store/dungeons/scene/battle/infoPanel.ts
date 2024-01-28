import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { animateText } from "@/services/dungeons/animation/animateText";
import { usePlayerStore } from "@/store/dungeons/scene/battle/player";

export const useInfoPanelStore = defineStore("dungeons/scene/battle/infoPanel", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const playerStore = usePlayerStore();
  const { inputPromptCursorPositionX, inputPromptCursorDisplayWidth } = storeToRefs(playerStore);
  const line1Text = ref("");
  const line1TextDisplayWidth = ref<number>();
  const line2Text = ref("");
  const isPlayerInputPromptCursorVisible = ref(false);
  const queuedMessages = ref<string[]>([]);
  const queuedOnComplete = ref<() => void>();
  const isQueuedMessagesSkipAnimation = ref(false);
  const isQueuedMessagesAnimationPlaying = ref(false);
  const isWaitingForPlayerSpecialInput = ref(false);

  const updateQueuedMessagesAndShowMessage = (messages: string[], onComplete?: () => void, isSkipAnimation = false) => {
    queuedMessages.value = messages;
    queuedOnComplete.value = onComplete;
    isQueuedMessagesSkipAnimation.value = isSkipAnimation;
    showMessage();
  };

  const showMessage = () => {
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
        inputPromptCursorPositionX.value =
          line1TextDisplayWidth.value ?? 0 + (inputPromptCursorDisplayWidth.value ?? 0) * 2.7;
        isPlayerInputPromptCursorVisible.value = true;
        isWaitingForPlayerSpecialInput.value = true;
        isQueuedMessagesAnimationPlaying.value = false;
      },
    });
  };

  const showMessageNoInputRequired = (message: string, onComplete?: () => void, isSkipAnimation?: true) => {
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
    line1TextDisplayWidth,
    line2Text,
    isPlayerInputPromptCursorVisible,
    isQueuedMessagesAnimationPlaying,
    isWaitingForPlayerSpecialInput,
    updateQueuedMessagesAndShowMessage,
    showMessage,
    showMessageNoInputRequired,
  };
});
