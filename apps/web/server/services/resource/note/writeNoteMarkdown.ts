import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { WriteNoteMarkdownInput } from "#shared/models/db/resource/note/WriteNoteMarkdownInput";
import type { ResourceInResource } from "@esposter/db-schema";
import type { JSONContent } from "@tiptap/core";

import { updateResourceContent } from "#server/services/resource/updateResourceContent";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { NoteMarkdownWriteMode } from "#shared/models/resource/note/NoteMarkdownWriteMode";
import { noteResourceSchema } from "#shared/models/resource/note/NoteResource";
import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { deserializeNoteMarkdown } from "#shared/services/resource/note/deserializeNoteMarkdown";
import { Operation } from "@esposter/shared";

// The Markdown parsed here into the note's own nodes, then written over the content as it stands when the write lands,
// Or after it. The document is checked against the kit the note is built on before it is saved, and the save reserves
// The assets it embeds like any other content write. Answers the Note's new contentVersion
export const writeNoteMarkdown = async (
  ctx: AuthedContext,
  resource: ResourceInResource,
  { contentVersion, markdown, mode }: WriteNoteMarkdownInput,
): Promise<number> => {
  const { resource: savedResource } = await updateResourceContent(
    ctx,
    resource,
    (storedContent) => {
      const { doc } = storedContent === null ? { doc: EMPTY_NOTE_DOC } : noteResourceSchema.parse(storedContent);
      const imported = deserializeNoteMarkdown(markdown).content ?? [];
      const content = mode === NoteMarkdownWriteMode.Replace ? imported : [...(doc.content ?? []), ...imported];
      const nextDoc: JSONContent = { content, type: "doc" };
      if (!noteDocumentSchema.safeParse(nextDoc).success)
        throw getInvalidOperationError(Operation.Create, "note", "the Markdown does not read as the content of a note");
      return { content: { doc: nextDoc }, result: undefined };
    },
    contentVersion,
  );
  return savedResource.contentVersion;
};
