import type { NoteResource } from "#shared/models/resource/note/NoteResource";

import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";

// The note a new one starts from, before its first save
export const createEmptyNote = (): NoteResource => ({ doc: EMPTY_NOTE_DOC });
