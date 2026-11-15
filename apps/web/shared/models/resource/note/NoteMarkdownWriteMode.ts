import { z } from "zod";

// How a Markdown write meets a Note's content: the Markdown replaces the content, or follows it
export const NoteMarkdownWriteMode = { Append: "Append", Replace: "Replace" } as const;
export type NoteMarkdownWriteMode = (typeof NoteMarkdownWriteMode)[keyof typeof NoteMarkdownWriteMode];

export const noteMarkdownWriteModeSchema = z.enum(NoteMarkdownWriteMode) satisfies z.ZodType<NoteMarkdownWriteMode>;
