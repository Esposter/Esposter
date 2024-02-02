import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { animateText } from "@/services/dungeons/animation/animateText";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useSettingsStore } from "@/store/dungeons/settings";

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
  const isQueuedMessagesAnimationPlaying = ref(false);
  const isWaitingForPlayerSpecialInput = ref(false);

  const updateQueuedMessagesAndShowMessage = (messages: string[], onComplete?: () => void) => {
    queuedMessages.value = messages;
    queuedOnComplete.value = onComplete;
    showMessage();
  };
  // These show message functions are called inside a callback which loses sight of the scope
  // that contains the battle scene store, so we need to grab it within the function
  // instead of referencing the store outside
  const showMessage = () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const settingsStore = useSettingsStore();
    const { isSkipBattleAnimations } = storeToRefs(settingsStore);
    activePanel.value = ActivePanel.Info;
    isWaitingForPlayerSpecialInput.value = false;
    isInputPromptCursorVisible.value = false;
    line1Text.value = "";

    const message = queuedMessages.value.shift();
    if (!message) {
      queuedOnComplete.value?.();
      queuedOnComplete.value = undefined;
      return;
    }

    if (isSkipBattleAnimations.value) {
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

  const showMessageNoInputRequired = (message: string, onComplete?: () => void) => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const settingsStore = useSettingsStore();
    const { isSkipBattleAnimations } = storeToRefs(settingsStore);
    activePanel.value = ActivePanel.Info;
    line1Text.value = "";

    if (isSkipBattleAnimations.value) {
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
