import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useSettingsStore } from "@/store/dungeons/settings";
import { sleep } from "vue-phaserjs";

export const useDialogStore = defineStore("dungeons/dialog", () => {
  const settingsStore = useSettingsStore();
  const inputPromptCursorX = ref();
  const inputPromptCursorDisplayWidth = ref<number>();
  const isInputPromptCursorVisible = ref(false);
  // We need to store a reference to the dialog UI since there could be multiple messages
  // that the player can go through and we have to wait for their input so we need to be able
  // to access the dialog when the player has inputted a value
  let dialogTarget: DialogTarget;
  let queuedMessages: DialogMessage[];
  let queuedOnComplete: (() => void) | undefined;
  const isQueuedMessagesAnimationPlaying = ref(false);
  const isWaitingForPlayerSpecialInput = ref(false);

  const handleShowMessageInput = async (scene: SceneWithPlugins, input: PlayerInput) => {
    if (isQueuedMessagesAnimationPlaying.value) return true;
    else if (isWaitingForPlayerSpecialInput.value) {
      if (input === PlayerSpecialInput.Confirm) await showMessage(scene);
      return true;
    }

    return false;
  };

  const updateQueuedMessagesAndShowMessage = async (
    scene: SceneWithPlugins,
    target: DialogTarget,
    messages: DialogMessage[],
  ) => {
    dialogTarget = target;
    queuedMessages = messages;
    return new Promise<void>((resolve) => {
      queuedOnComplete = resolve;
      showMessage(scene);
    });
  };
  // Called after updateQueuedMessagesAndShowMessage
  const showMessage = async (scene: SceneWithPlugins) => {
    isWaitingForPlayerSpecialInput.value = false;
    isInputPromptCursorVisible.value = false;
    dialogTarget.reset();

    const message = queuedMessages.shift();
    if (!message) {
      queuedOnComplete?.();
      return;
    }

    // Tell other components like the dialog that we're ready to show our message
    phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

    if (settingsStore.isSkipAnimations) {
      const textDelay = useTextDelay();
      dialogTarget.setMessage(message);
      // Show the cursor after vue's rendering cycle has caught up with phaser
      // Seems like it takes exactly 2 ticks for vue to register phaser's text changes
      await sleep(scene, textDelay.value * 2);
      showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
      isWaitingForPlayerSpecialInput.value = true;
      return;
    }

    const dialogTargetText = computed({
      get: () => dialogTarget.message.value.text,
      set: (newText) => {
        dialogTarget.message.value.text = newText;
      },
    });
    dialogTarget.message.value.title = message.title;
    isQueuedMessagesAnimationPlaying.value = true;
    await useAnimateText(scene, dialogTargetText, message.text);
    showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
    isWaitingForPlayerSpecialInput.value = true;
    isQueuedMessagesAnimationPlaying.value = false;
  };

  const showMessageNoInputRequired = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
    target.reset();
    phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

    if (settingsStore.isSkipAnimations) {
      target.setMessage(message);
      return;
    }

    const targetText = computed({
      get: () => target.message.value.text,
      set: (newText) => {
        target.message.value.text = newText;
      },
    });
    target.message.value.title = message.title;
    return useAnimateText(scene, targetText, message.text);
  };

  const showInputPromptCursor = (x: number) => {
    inputPromptCursorX.value = x;
    isInputPromptCursorVisible.value = true;
  };

  return {
    handleShowMessageInput,
    inputPromptCursorDisplayWidth,
    inputPromptCursorX,
    isInputPromptCursorVisible,
    isWaitingForPlayerSpecialInput,
    showMessageNoInputRequired,
    updateQueuedMessagesAndShowMessage,
  };
});
