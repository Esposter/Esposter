import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { animateText } from "@/services/dungeons/animation/animateText";

export const useInfoPanelStore = defineStore("dungeons/battle/infoPanel", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const line1Text = ref("");
  const line1TextDisplayWidth = ref<number>();
  const line2Text = ref("");
  const inputPromptCursorPositionX = ref();
  const inputPromptCursorDisplayWidth = ref<number>();
  const isInputPromptCursorVisible = ref(false);
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
    isInputPromptCursorVisible.value = false;
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
          (line1TextDisplayWidth.value ?? 0) + (inputPromptCursorDisplayWidth.value ?? 0) * 2.7;
        isInputPromptCursorVisible.value = true;
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
    inputPromptCursorPositionX,
    inputPromptCursorDisplayWidth,
    isInputPromptCursorVisible,
    isQueuedMessagesAnimationPlaying,
    isWaitingForPlayerSpecialInput,
    updateQueuedMessagesAndShowMessage,
    showMessage,
    showMessageNoInputRequired,
  };
});
