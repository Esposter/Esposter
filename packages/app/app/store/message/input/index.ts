import type { ComposerTarget } from "@/models/message/ComposerTarget";
import type { Draft } from "@/models/message/Draft";
import type { Editor } from "@tiptap/core";

import { dayjs } from "#shared/services/dayjs";
import { validateFile } from "@/services/file/validateFile";
import { getComposerKey } from "@/services/message/composer/getComposerKey";
import { getDraft } from "@/services/message/draft/getDraft";
import { removeDraft } from "@/services/message/draft/removeDraft";
import { setDraft } from "@/services/message/draft/setDraft";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { getIsServer } from "@esposter/shared";

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
  const drafts = ref(new Map<string, Draft>());
  // The one way a room's draft is written: `drafts` is the reactive source of truth and localStorage only its
  // Persistence, so both move together here rather than at each call site. Content is sanitized on the way in,
  // And content that sanitizes to nothing removes the draft instead of storing an empty one — an empty draft
  // Would otherwise show up as a draft in the room list and the drafts page.
  // Returns the stored draft, or undefined when the room now has none. Whether `input` follows is left to the
  // Caller, because that is the only thing the three writers disagree on: the editor's own debounced save must
  // Not write the sanitized text back into the editor the user is still typing in.
  const syncDraft = (composerKey: string, content: string): Draft | undefined => {
    const draft = content && !EMPTY_TEXT_REGEX.test(content) ? setDraft(composerKey, content) : undefined;
    if (draft && !EMPTY_TEXT_REGEX.test(draft.content)) {
      drafts.value.set(composerKey, draft);
      return draft;
    }

    removeDraft(composerKey);
    drafts.value.delete(composerKey);
    return undefined;
  };
  // The server renders once and holds no localStorage, so there is nothing to restore there.
  if (!getIsServer()) {
    const draftKeyPrefix = LocalStorageKey.Draft("");
    // Collected before anything is written, because restoring removes the keys that sanitize away and
    // `localStorage.key(index)` would then walk past a shifted entry
    const draftComposerKeys: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith(draftKeyPrefix)) draftComposerKeys.push(key.slice(draftKeyPrefix.length));
    }

    for (const composerKey of draftComposerKeys) {
      const storedDraft = getDraft(composerKey);
      if (!storedDraft) continue;
      setInput(composerKey, syncDraft(composerKey, storedDraft.content)?.content ?? "");
    }
  }

  const storeDraft = (composerKey: string, content: string) => {
    if (getIsServer()) return;
    setInput(composerKey, syncDraft(composerKey, content)?.content ?? "");
  };
  // One watcher per composer rather than one over "whatever is being typed in": both are on screen at once, so
  // A single source would file the thread's reply under the room's key the moment the pane has focus
  const DRAFT_DEBOUNCE_MS = dayjs.duration(0.3, "seconds").asMilliseconds();

  watchDebounced(
    () => [input.value, roomStore.currentRoomId],
    ([newInput, roomId]) => {
      if (!roomId) return;
      syncDraft(roomId, newInput ?? "");
    },
    { debounce: DRAFT_DEBOUNCE_MS },
  );

  watchDebounced(
    () => [threadInput.value, getComposerKey(threadTarget.value)] as const,
    ([newThreadInput, composerKey]) => {
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
