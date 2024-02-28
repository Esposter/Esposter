import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { DialogTarget } from "@/models/dungeons/DialogTarget";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { animateText } from "@/services/dungeons/animation/animateText";
import { DEFAULT_TEXT_DELAY } from "@/services/dungeons/animation/constants";
import { useSettingsStore } from "@/store/dungeons/settings";
import { sleep } from "@/util/sleep";

export const useDialogStore = defineStore("dungeons/dialog", () => {
  const phaserStore = usePhaserStore();
  const { scene, sceneKey } = storeToRefs(phaserStore);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const inputPromptCursorX = ref();
  const inputPromptCursorDisplayWidth = ref<number>();
  const isInputPromptCursorVisible = ref(false);
  // We need to store a reference to the dialog UI since there could be multiple messages
  // that the player can go through and we have to wait for their input so we need to be able
  // to access the dialog when the player has inputted a value
  let dialogTarget: DialogTarget;
  const queuedMessages = ref<string[]>([]);
  const queuedOnComplete = ref<() => void>();
  const isQueuedMessagesAnimationPlaying = ref(false);
  const isWaitingForPlayerSpecialInput = ref(false);

  const handleShowMessageInput = (input: PlayerInput) => {
    if (input === PlayerSpecialInput.Confirm)
      if (isQueuedMessagesAnimationPlaying.value) return true;
      else if (isWaitingForPlayerSpecialInput.value) {
        showMessage();
        return true;
      }

    return false;
  };

  const updateQueuedMessagesAndShowMessage = (target: DialogTarget, messages: string[], onComplete?: () => void) => {
    queuedMessages.value = messages;
    queuedOnComplete.value = onComplete;
    dialogTarget = target;
    showMessage();
  };

  const showMessage = () => {
    isWaitingForPlayerSpecialInput.value = false;
    isInputPromptCursorVisible.value = false;
    dialogTarget.text.value = "";
    // Tell other components like the dialog that we're ready to show our message
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey.value}`);

    const message = queuedMessages.value.shift();
    if (!message) {
      queuedOnComplete.value?.();
      queuedOnComplete.value = undefined;
      return;
    }

    if (isSkipAnimations.value) {
      dialogTarget.text.value = message;
      sleep(DEFAULT_TEXT_DELAY).then(
        () => {
          showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
          isWaitingForPlayerSpecialInput.value = true;
        },
        () => {
          return;
        },
      );
      return;
    }

    isQueuedMessagesAnimationPlaying.value = true;
    animateText(scene.value, dialogTarget.text, message, {
      onComplete: () => {
        showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
        isWaitingForPlayerSpecialInput.value = true;
        isQueuedMessagesAnimationPlaying.value = false;
      },
    });
  };

  const showMessageNoInputRequired = (text: DialogTarget["text"], message: string, onComplete?: () => void) => {
    text.value = "";
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey.value}`);

    if (isSkipAnimations.value) {
      text.value = message;
      onComplete?.();
      return;
    }

    animateText(scene.value, text, message, { onComplete });
  };

  const showInputPromptCursor = (x: number) => {
    inputPromptCursorX.value = x;
    isInputPromptCursorVisible.value = true;
  };

  return {
    inputPromptCursorX,
    inputPromptCursorDisplayWidth,
    isInputPromptCursorVisible,
    handleShowMessageInput,
    updateQueuedMessagesAndShowMessage,
    showMessageNoInputRequired,
  };
});
