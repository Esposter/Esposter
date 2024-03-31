import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
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
  const queuedMessages = ref<DialogMessage[]>([]);
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

  const updateQueuedMessagesAndShowMessage = (
    target: DialogTarget,
    messages: DialogMessage[],
    onComplete?: () => void,
  ) => {
    queuedMessages.value = messages;
    queuedOnComplete.value = onComplete;
    dialogTarget = target;
    showMessage();
  };

  const showMessage = () => {
    isWaitingForPlayerSpecialInput.value = false;
    isInputPromptCursorVisible.value = false;
    dialogTarget.reset();
    // Tell other components like the dialog that we're ready to show our message
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey.value}`);

    const message = queuedMessages.value.shift();
    if (!message) {
      queuedOnComplete.value?.();
      queuedOnComplete.value = undefined;
      return;
    }

    if (isSkipAnimations.value) {
      const textDelay = useTextDelay();
      dialogTarget.setMessage(message);
      void sleep(textDelay.value).then(() => {
        showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
        isWaitingForPlayerSpecialInput.value = true;
      });
      return;
    }

    const targetText = computed({
      get: () => dialogTarget.message.value.text,
      set: (newText) => {
        dialogTarget.message.value.text = newText;
      },
    });
    dialogTarget.message.value.title = message.title;
    isQueuedMessagesAnimationPlaying.value = true;
    useAnimateText(scene.value, targetText, message.text, {
      onComplete: () => {
        showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
        isWaitingForPlayerSpecialInput.value = true;
        isQueuedMessagesAnimationPlaying.value = false;
      },
    });
  };

  const showMessageNoInputRequired = (target: DialogTarget, message: DialogMessage, onComplete?: () => void) => {
    target.reset();
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey.value}`);

    if (isSkipAnimations.value) {
      target.setMessage(message);
      onComplete?.();
      return;
    }

    const targetText = computed({
      get: () => dialogTarget.message.value.text,
      set: (newText) => {
        dialogTarget.message.value.text = newText;
      },
    });
    dialogTarget.message.value.title = message.title;
    useAnimateText(scene.value, targetText, message.text, { onComplete });
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
