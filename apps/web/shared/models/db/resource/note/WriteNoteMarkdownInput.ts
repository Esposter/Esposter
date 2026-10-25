import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { noteMarkdownWriteModeSchema } from "#shared/models/resource/note/NoteMarkdownWriteMode";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const writeNoteMarkdownInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  // The version the write was made against; left out, it applies to the latest content
  contentVersion: selectResourceInResourceSchema.shape.contentVersion.optional(),
  markdown: z
    .string()
    .max(MAX_RESOURCE_CONTENT_SIZE)
    .meta({ description: "The note's Markdown: headings, lists, task lists, links, emphasis and code blocks" }),
  mode: noteMarkdownWriteModeSchema.meta({
    description: "Replace the note's content with the Markdown, or Append the Markdown after the content it has",
  }),
});
export type WriteNoteMarkdownInput = z.infer<typeof writeNoteMarkdownInputSchema>;
