import { createSuggestionExtension } from "@/services/message/editor/createSuggestionExtension";
import { NoteSlashSuggestion } from "@/services/resource/note/NoteSlashSuggestion";

const NoteSlashExtension = createSuggestionExtension("noteSlash");

export const useNoteSlashExtension = () => NoteSlashExtension.configure({ suggestion: NoteSlashSuggestion });
