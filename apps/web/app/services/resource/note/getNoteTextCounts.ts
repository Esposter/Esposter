import type { NoteTextCounts } from "#src/models/resource/note/NoteTextCounts";
import type { Node } from "@tiptap/pm/model";

import { EN_US_WORD_SEGMENTER } from "#src/services/resource/note/constants";

// A block boundary reads as a space, so the last word of one paragraph and the first of the next are two words
export const getNoteTextCounts = (doc: Node, from: number, to: number): NoteTextCounts => {
  const text = doc.textBetween(from, to, " ");
  const words = [...EN_US_WORD_SEGMENTER.segment(text)].filter(({ isWordLike }) => isWordLike).length;
  // oxlint-disable-next-line typescript/no-misused-spread -- characters are counted by code point, the unit the count names
  return { characters: [...text].length, words };
};
