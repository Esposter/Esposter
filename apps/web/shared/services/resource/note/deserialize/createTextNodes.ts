import type { InlineMark } from "#shared/models/resource/note/deserialize/InlineMark";
import type { JSONContent } from "@tiptap/core";

export const createTextNodes = (text: string, marks: InlineMark[] = []): JSONContent[] =>
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- rich-text content, whose spaces are content
  text === "" ? [] : [{ marks, text, type: "text" }];
