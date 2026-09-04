import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useSettingsStore } from "@/store/dungeons/settings";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";
import { sleepScene } from "vue-phaserjs";

export const useDialogStore = defineStore("dungeons/dialog", () => {
  const settingsStore = useSettingsStore();
  const inputPromptCursorX = ref<number>();
  const inputPromptCursorDisplayWidth = ref<number>();
  const isInputPromptCursorVisible = ref(false);
  // Store a reference to the dialog UI: the player may step through multiple messages, so we need
  // To access the dialog whenever they input a value.
  let dialogTarget: DialogTarget;
  let queuedMessages: DialogMessage[];
  let queuedOnComplete: (() => void) | undefined;
  const isQueuedMessagesAnimationPlaying = ref(false);
  const isWaitingForPlayerSpecialInput = ref(false);

  const onPlayerInput = async (scene: SceneWithPlugins, input: PlayerInput) => {
    if (isQueuedMessagesAnimationPlaying.value) return true;
    else if (isWaitingForPlayerSpecialInput.value) {
      if (input === PlayerSpecialInput.Confirm) await showMessage(scene);
      return true;
    }

    return false;
  };

  const updateQueuedMessagesAndShowMessage = (
    scene: SceneWithPlugins,
    target: DialogTarget,
    messages: DialogMessage[],
  ) => {
    dialogTarget = target;
    queuedMessages = messages;
    return new Promise<void>(
      getSynchronizedFunction(async (resolve) => {
        queuedOnComplete = resolve;
        // The gate the dialog flow waits on, so a message that fails to show resolves it rather than stalling
        // The flow behind a dialog that is never going to appear
        await getResultAsync(() => showMessage(scene)).match(noop, (error) => {
          console.error(error);
          resolve();
        });
      }),
    );
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
    // Signal other components that we're ready to show our message.
    phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

    if (settingsStore.isSkipAnimations) {
      const textDelayMs = useTextDelayMs();
      dialogTarget.setMessage(message);
      // Show the cursor after vue's rendering cycle has caught up with phaser
      // Seems like it takes exactly 2 ticks for vue to register phaser's text changes
      await sleepScene(scene, textDelayMs.value * 2);
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
    // The flag gates player input, so an animation that rejects has to clear it or input stays blocked forever
    await withFinalizerAsync(
      () => useAnimateText(scene, dialogTargetText, message.text),
      () => {
        isQueuedMessagesAnimationPlaying.value = false;
      },
    );
    showInputPromptCursor(unref(dialogTarget.inputPromptCursorX));
    isWaitingForPlayerSpecialInput.value = true;
  };

  const showMessageNoInputRequired = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
    target.reset();
    phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

    if (settingsStore.isSkipAnimations) {
      target.setMessage(message);
      return undefined;
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
    inputPromptCursorDisplayWidth,
    inputPromptCursorX,
    isInputPromptCursorVisible,
    isWaitingForPlayerSpecialInput,
    onPlayerInput,
    showMessageNoInputRequired,
    updateQueuedMessagesAndShowMessage,
  };
});
