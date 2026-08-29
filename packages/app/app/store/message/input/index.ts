import type { ComposerTarget } from "@/models/message/ComposerTarget";
import type { Draft } from "@/models/message/Draft";
import type { Editor } from "@tiptap/core";

import { validateFile } from "@/services/file/validateFile";
import { getComposerKey } from "@/services/message/composer/getComposerKey";
import { draftsSerializer } from "@/services/message/draft/draftsSerializer";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { sanitizeTextHtml, SECOND } from "@esposter/shared";

export const useInputStore = defineStore("message/input", () => {
  const roomStore = useRoomStore();
  // One map over every composer, keyed by composer: the room's own slice is the current room's key, which is
  // What `input` tracks, and the thread pane's is its own entry beside it. The two composers are on screen
  // Together, so a single shared ref would have the room's message and the reply overwrite each other
  const { data: input, getData: getInput, setData: setInput } = useDataMap(() => roomStore.currentRoomId, "");
  const getComposerInput = (target: ComposerTarget) => getInput(getComposerKey(target)) ?? "";
  // Which thread the pane's composer is on, written by that composer rather than read off the thread store:
  // The dependency runs UI → store, so instantiating this one can never drag in the drawer state — and the
  // Layout store it would reach through resolves Vuetify's display, which needs a component instance
  const threadTarget = ref<ComposerTarget>({ roomId: "", threadRootRowKey: "" });
  const threadInput = computed({
    get: () => getComposerInput(threadTarget.value),
    set: (value) => {
      setInput(getComposerKey(threadTarget.value), value);
    },
  });
  const uploadFileStore = useUploadFileStore();
  // Persisted state rather than a Map mirrored into localStorage by hand: the write happens because the Map
  // Changed, and a server render reads the default empty one — see /docs/architecture/browser-execution
  // `flush: "sync"` because a draft is persisted state rather than rendered state: the default pre-flush write
  // Would leave a window in which the composer has been emptied but the storage still holds what was in it
  const drafts = useLocalStorage(LocalStorageKey.Drafts, new Map<string, Draft>(), {
    flush: "sync",
    serializer: draftsSerializer,
  });
  // The one way a room's draft is written. Content is sanitized on the way in, and content that sanitizes to
  // Nothing removes the draft instead of storing an empty one — an empty draft would otherwise show up as a
  // Draft in the room list and the drafts page.
  // Returns the stored draft, or undefined when the room now has none. Whether `input` follows is left to the
  // Caller, because that is the only thing the three writers disagree on: the editor's own debounced save must
  // Not write the sanitized text back into the editor the user is still typing in.
  // `updatedAt` is a parameter so restoring a stored draft can hand back the stamp it was written with: the
  // Drafts list is ordered by it, and a fresh stamp per boot would reorder every draft into whatever order the
  // Map happened to restore in.
  const syncDraft = (composerKey: string, content: string, updatedAt = new Date()): Draft | undefined => {
    const sanitizedContent = content && !EMPTY_TEXT_REGEX.test(content) ? sanitizeTextHtml(content) : "";
    if (sanitizedContent && !EMPTY_TEXT_REGEX.test(sanitizedContent)) {
      const draft: Draft = { content: sanitizedContent, updatedAt };
      drafts.value.set(composerKey, draft);
      return draft;
    }

    drafts.value.delete(composerKey);
    return undefined;
  };

  // Restoring is re-sanitizing what a previous session stored, so a draft whose content no longer survives the
  // Sanitizer is dropped here rather than shown. On the server the Map is empty and this does nothing
  for (const [composerKey, storedDraft] of drafts.value)
    setInput(composerKey, syncDraft(composerKey, storedDraft.content, storedDraft.updatedAt)?.content ?? "");

  const storeDraft = (composerKey: string, content: string) => {
    setInput(composerKey, syncDraft(composerKey, content)?.content ?? "");
  };
  // One watcher per composer rather than one over "whatever is being typed in": both are on screen at once, so
  // A single source would file the thread's reply under the room's key the moment the pane has focus
  const DRAFT_DEBOUNCE_MS = 0.3 * SECOND;
  // The target is one of the watched sources, so switching it inside the debounce window cancels the pending
  // Save and reschedules it against the composer the user moved to. The outgoing keystrokes are still in the
  // Map, so nothing looks wrong until a reload finds they were never persisted — flush them under their own key
  const flushOutgoingDraft = (previousComposerKey?: string, previousInput?: string, composerKey?: string) => {
    if (previousComposerKey && previousComposerKey !== composerKey) syncDraft(previousComposerKey, previousInput ?? "");
  };

  watchDebounced(
    () => [input.value, roomStore.currentRoomId],
    ([newInput, roomId], previous) => {
      const [previousInput, previousRoomId] = previous ?? [];
      flushOutgoingDraft(previousRoomId, previousInput, roomId);
      if (!roomId) return;

      syncDraft(roomId, newInput ?? "");
    },
    { debounce: DRAFT_DEBOUNCE_MS },
  );

  watchDebounced(
    () => [threadInput.value, getComposerKey(threadTarget.value)] as const,
    ([newThreadInput, composerKey], previous) => {
      const [previousThreadInput, previousComposerKey] = previous ?? [];
      flushOutgoingDraft(previousComposerKey, previousThreadInput, composerKey);
      if (!threadTarget.value.threadRootRowKey) return;

      syncDraft(composerKey, newThreadInput);
    },
    { debounce: DRAFT_DEBOUNCE_MS },
  );

  const clearDraft = (composerKey: string) => {
    syncDraft(composerKey, "");
    setInput(composerKey, "");
  };
  // Emptying a composer after its send — a room's own composer keys by its bare room id, which is what every
  // Caller outside a composer already holds
  const clearComposer = (target: ComposerTarget) => {
    clearDraft(getComposerKey(target));
  };

  const validateInput = (target: ComposerTarget, editor?: Editor, isDisplayError?: true) => {
    const files = uploadFileStore.getComposerFiles(target);
    if (isDisplayError && !files.every(({ size }) => validateFile(size).isValid)) {
      useEmptyFileAlert();
      return false;
    } else
      return (
        !uploadFileStore.getIsFileLoading(target) &&
        (Boolean(editor && !EMPTY_TEXT_REGEX.test(editor.getText())) || files.length > 0)
      );
  };

  return {
    clearComposer,
    clearDraft,
    drafts,
    getComposerInput,
    input,
    storeDraft,
    threadInput,
    threadTarget,
    validateInput,
  };
});
