import type { Draft } from "@/models/message/Draft";
import type { Editor } from "@tiptap/core";

import { dayjs } from "#shared/services/dayjs";
import { validateFile } from "@/services/file/validateFile";
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
  const { data: input, setData: setInput } = useDataMap(() => roomStore.currentRoomId, "");
  const uploadFileStore = useUploadFileStore();
  const drafts = ref(new Map<string, Draft>());
  // The one way a room's draft is written: `drafts` is the reactive source of truth and localStorage only its
  // Persistence, so both move together here rather than at each call site. Content is sanitized on the way in,
  // And content that sanitizes to nothing removes the draft instead of storing an empty one — an empty draft
  // Would otherwise show up as a draft in the room list and the drafts page.
  // Returns the stored draft, or undefined when the room now has none. Whether `input` follows is left to the
  // Caller, because that is the only thing the three writers disagree on: the editor's own debounced save must
  // Not write the sanitized text back into the editor the user is still typing in.
  const syncDraft = (roomId: string, content: string): Draft | undefined => {
    const draft = content && !EMPTY_TEXT_REGEX.test(content) ? setDraft(roomId, content) : undefined;
    if (draft && !EMPTY_TEXT_REGEX.test(draft.content)) {
      drafts.value.set(roomId, draft);
      return draft;
    }

    removeDraft(roomId);
    drafts.value.delete(roomId);
    return undefined;
  };
  // The server renders once and holds no localStorage, so there is nothing to restore there.
  if (!getIsServer()) {
    const draftKeyPrefix = LocalStorageKey.Draft("");
    // Collected before anything is written, because restoring removes the keys that sanitize away and
    // `localStorage.key(index)` would then walk past a shifted entry
    const draftRoomIds: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith(draftKeyPrefix)) draftRoomIds.push(key.slice(draftKeyPrefix.length));
    }

    for (const roomId of draftRoomIds) {
      const storedDraft = getDraft(roomId);
      if (!storedDraft) continue;
      setInput(roomId, syncDraft(roomId, storedDraft.content)?.content ?? "");
    }
  }

  const storeDraft = (roomId: string, content: string) => {
    if (getIsServer()) return;
    setInput(roomId, syncDraft(roomId, content)?.content ?? "");
  };

  watchDebounced(
    () => [input.value, roomStore.currentRoomId],
    ([newInput, roomId]) => {
      if (!roomId) return;
      syncDraft(roomId, newInput ?? "");
    },
    { debounce: dayjs.duration(0.3, "seconds").asMilliseconds() },
  );

  const clearDraft = (roomId: string) => {
    syncDraft(roomId, "");
    setInput(roomId, "");
  };

  const validateInput = (editor?: Editor, isDisplayError?: true) => {
    if (isDisplayError && !uploadFileStore.files.every(({ size }) => validateFile(size).isValid)) {
      useEmptyFileAlert();
      return false;
    } else
      return (
        !uploadFileStore.isFileLoading &&
        (Boolean(editor && !EMPTY_TEXT_REGEX.test(editor.getText())) || uploadFileStore.files.length > 0)
      );
  };

  return {
    clearDraft,
    drafts,
    input,
    storeDraft,
    validateInput,
  };
});
