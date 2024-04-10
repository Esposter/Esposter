import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useDialogStore = defineStore("dungeons/dialog", () => {
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

  const handleShowMessageInput = (input: PlayerInput, scene: SceneWithPlugins) => {
    if (isQueuedMessagesAnimationPlaying.value) return true;
    else if (isWaitingForPlayerSpecialInput.value) {
      if (input === PlayerSpecialInput.Confirm) showMessage(scene);
      return true;
    }

    return false;
  };

  const updateQueuedMessagesAndShowMessage = (
    scene: SceneWithPlugins,
    target: DialogTarget,
    messages: DialogMessage[],
    onComplete?: () => void,
  ) => {
    queuedMessages.value = messages;
    queuedOnComplete.value = onComplete;
    dialogTarget = target;
    showMessage(scene);
  };

  const showMessage = (scene: SceneWithPlugins) => {
    isWaitingForPlayerSpecialInput.value = false;
    isInputPromptCursorVisible.value = false;
    dialogTarget.reset();
    // Tell other components like the dialog that we're ready to show our message
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key as SceneKey}`);

    const message = queuedMessages.value.shift();
    if (!message) {
      queuedOnComplete.value?.();
      queuedOnComplete.value = undefined;
      return;
    }

    if (isSkipAnimations.value) {
      dialogTarget.setMessage(message);
      showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
      isWaitingForPlayerSpecialInput.value = true;
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
    useAnimateText(scene, targetText, message.text, {
      onComplete: () => {
        showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
        isWaitingForPlayerSpecialInput.value = true;
        isQueuedMessagesAnimationPlaying.value = false;
      },
    });
  };

  const showMessageNoInputRequired = (
    scene: SceneWithPlugins,
    target: DialogTarget,
    message: DialogMessage,
    onComplete?: () => void,
  ) => {
    target.reset();
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key as SceneKey}`);

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
    useAnimateText(scene, targetText, message.text, { onComplete });
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
