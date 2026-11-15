import { createSuggestionExtension } from "#src/services/message/editor/createSuggestionExtension";
import { NoteSlashSuggestion } from "#src/services/resource/note/NoteSlashSuggestion";

const NoteSlashExtension = createSuggestionExtension("noteSlash");

export const useNoteSlashExtension = () => NoteSlashExtension.configure({ suggestion: NoteSlashSuggestion });
