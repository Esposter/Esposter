import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/events";
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
  let queuedMessages: DialogMessage[];
  // We need a map of a list of onComplete hooks based on the dialog target id
  // to allow for recursive onComplete hook calls and cleaning them up later
  const dialogOnCompleteListMap = new Map<string, (() => void)[]>();
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
    await new Promise<void>((resolve) => {
      const onComplete = () => {
        resolve();
      };
      const onCompleteList = dialogOnCompleteListMap.get(dialogTarget.id);
      if (onCompleteList) onCompleteList.push(onComplete);
      else dialogOnCompleteListMap.set(dialogTarget.id, [onComplete]);
      showMessage(scene, dialogTarget);
    });
  };
  // By default, this will show the message of what's last been set
  // but because we allow recursive calls that may show messages in other
  // dialog targets, we need to also allow being able to specify them
  const showMessage = async (scene: SceneWithPlugins, target = dialogTarget) => {
    isWaitingForPlayerSpecialInput.value = false;
    isInputPromptCursorVisible.value = false;
    target.reset();

    const message = queuedMessages.shift();
    if (!message) {
      const queuedOnComplete = dialogOnCompleteListMap.get(target.id)?.shift();
      if (!queuedOnComplete) return;
      queuedOnComplete();
      return;
    }

    // Tell other components like the dialog that we're ready to show our message
    phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

    if (isSkipAnimations.value) {
      const textDelay = useTextDelay();
      target.setMessage(message);
      // Show the cursor after vue's rendering cycle has caught up with phaser
      // Seems like it takes exactly 2 ticks for vue to register phaser's text changes
      scene.time.delayedCall(textDelay.value * 2, () => {
        showInputPromptCursor(unref(target.inputPromptCursorX));
        isWaitingForPlayerSpecialInput.value = true;
      });
      return;
    }

    const targetText = computed({
      get: () => target.message.value.text,
      set: (newText) => {
        target.message.value.text = newText;
      },
    });
    target.message.value.title = message.title;
    isQueuedMessagesAnimationPlaying.value = true;
    await useAnimateText(scene, targetText, message.text);
    showInputPromptCursor(unref(target.inputPromptCursorX));
    isWaitingForPlayerSpecialInput.value = true;
    isQueuedMessagesAnimationPlaying.value = false;
  };

  const showMessageNoInputRequired = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
    target.reset();
    phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

    if (isSkipAnimations.value) {
      target.setMessage(message);
      return;
    }

    const targetText = computed({
      get: () => dialogTarget.message.value.text,
      set: (newText) => {
        dialogTarget.message.value.text = newText;
      },
    });
    dialogTarget.message.value.title = message.title;
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
