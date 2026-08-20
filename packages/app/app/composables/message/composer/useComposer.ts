import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";

// Everything a composer needs that does not depend on which composer it is. The room's and the thread pane's
// Differ only in their target, in the room's extra slash-command extension, and in the header they render above
// The editor — so the wiring below is written once and the two call sites keep only what actually differs
export const useComposer = async (target: MaybeRefOrGetter<ComposerTarget>) => {
  const dataStore = useDataStore();
  const { sendMessage } = dataStore;
  const keyboardExtension = await useKeyboardShortcutsExtension((editor) => sendMessage(editor, toValue(target)));
  const codeBlockExtension = useCodeBlockExtension();
  const emojiExtension = useEmojiExtension();
  // The mention extension is a computed — it restyles itself from the theme — so the stack is one too, and the
  // Whole array has to be rebuilt when it changes rather than capturing the ref
  const mentionExtension = useMentionExtension();
  const extensions = computed(() => [keyboardExtension, codeBlockExtension, emojiExtension, mentionExtension.value]);
  const inputStore = useInputStore();
  const { validateInput } = inputStore;
  return {
    extensions,
    sendMessage,
    uploadFiles: useUploadFiles(target),
    validateInput,
  };
};
