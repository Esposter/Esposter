import type { WordFilterFormData } from "@/models/message/moderation/WordFilterFormData";

// The save of a word filter form, applied to the filter the room holds now. A field the reader did not change takes what
// The room holds, and each word the reader added or removed is applied to that list, so an edit another moderator made
// Since the form read the room is kept rather than written back over
export const mergeWordFilterFormData = (
  base: WordFilterFormData,
  issued: WordFilterFormData,
  current: WordFilterFormData,
): WordFilterFormData => {
  const addedWords = issued.words.filter((word) => !base.words.includes(word));
  const removedWords = new Set(base.words.filter((word) => !issued.words.includes(word)));
  return {
    action: issued.action === base.action ? current.action : issued.action,
    timeoutDurationMs:
      issued.timeoutDurationMs === base.timeoutDurationMs ? current.timeoutDurationMs : issued.timeoutDurationMs,
    words: [
      ...current.words.filter((word) => !removedWords.has(word)),
      ...addedWords.filter((word) => !current.words.includes(word)),
    ],
  };
};
