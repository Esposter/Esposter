import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
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
  let queuedMessages: DialogMessage[];
  // We need a map of onComplete hooks based on the dialog target id
  // to allow for recursive onComplete hook calls and cleaning them up later
  const queuedOnCompleteMap = new Map<string, () => void>();
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
    dialogTarget = target;
    queuedMessages = messages;
    if (onComplete) queuedOnCompleteMap.set(dialogTarget.id, onComplete);
    showMessage(scene, dialogTarget);
  };
  // By default, this will show the message of what's last been set
  // but because we allow recursive calls that may show messages in other
  // dialog targets, we need to also allow being able to specify them
  const showMessage = (scene: SceneWithPlugins, target = dialogTarget) => {
    isWaitingForPlayerSpecialInput.value = false;
    isInputPromptCursorVisible.value = false;
    target.reset();

    const message = queuedMessages.shift();
    if (!message) {
      const queuedOnComplete = queuedOnCompleteMap.get(target.id);
      if (!queuedOnComplete) return;
      queuedOnComplete();
      queuedOnCompleteMap.delete(target.id);
      return;
    }

    // Tell other components like the dialog that we're ready to show our message
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key}`);

    if (isSkipAnimations.value) {
      target.setMessage(message);
      showInputPromptCursor(unref(target.inputPromptCursorX));
      isWaitingForPlayerSpecialInput.value = true;
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
    useAnimateText(scene, targetText, message.text, {
      onComplete: () => {
        showInputPromptCursor(unref(target.inputPromptCursorX));
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
    phaserEventEmitter.emit(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key}`);

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
    isWaitingForPlayerSpecialInput,
    handleShowMessageInput,
    updateQueuedMessagesAndShowMessage,
    showMessageNoInputRequired,
  };
});
