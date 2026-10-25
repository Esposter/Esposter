import type { InlineMark } from "@/models/resource/note/deserialize/InlineMark";
import type { JSONContent } from "@tiptap/core";

export const createTextNodes = (text: string, marks: InlineMark[] = []): JSONContent[] =>
  text === "" ? [] : [{ marks, text, type: "text" }];
