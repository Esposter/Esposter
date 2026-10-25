import { z } from "zod";

// How a Markdown write meets a Note's content: the Markdown replaces the content, or follows it
export enum NoteMarkdownWriteMode {
  Append = "Append",
  Replace = "Replace",
}

export const noteMarkdownWriteModeSchema = z.enum(NoteMarkdownWriteMode) satisfies z.ZodType<NoteMarkdownWriteMode>;
