import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";

// Everything a composer needs that does not depend on which composer it is — the room's and the thread pane's
// Differ only in their target, the room's extra slash-command extension, and the header above the editor
export const useComposer = async (target: MaybeRefOrGetter<ComposerTarget>) => {
  const dataStore = useDataStore();
  const { sendComposerMessage } = dataStore;
  const keyboardExtension = await useKeyboardShortcutsExtension((editor) =>
    sendComposerMessage(editor, toValue(target)),
  );
  const codeBlockExtension = useCodeBlockExtension();
  const emojiExtension = useEmojiExtension();
  const customEmojiExtension = useCustomEmojiExtension();
  // The mention extension restyles itself from the theme, so the stack is a computed rather than a fixed array
  const mentionExtension = useMentionExtension();
  const extensions = computed(() => [
    keyboardExtension,
    codeBlockExtension,
    emojiExtension,
    customEmojiExtension,
    mentionExtension.value,
  ]);
  const inputStore = useInputStore();
  const { validateInput } = inputStore;
  return {
    extensions,
    sendComposerMessage,
    uploadFiles: useUploadFiles(target),
    validateInput,
  };
};
