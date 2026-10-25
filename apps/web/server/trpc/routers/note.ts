import { writeNoteMarkdown } from "#server/services/resource/note/writeNoteMarkdown";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { McpScope } from "#shared/models/auth/McpScope";
import { writeNoteMarkdownInputSchema } from "#shared/models/db/resource/note/WriteNoteMarkdownInput";
import { ResourceType } from "@esposter/db-schema";

export const noteRouter = router({
  ...createResourceProcedures(ResourceType.Note),
  writeNoteMarkdown: getOwnerProcedure(ResourceType.Note, writeNoteMarkdownInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Write a Note's content from Markdown, which the server parses into the note's own headings, lists, task lists, links, emphasis and code blocks. Mode Replace makes the Markdown the whole content; Append puts it after the content the Note has. Pass the contentVersion you read and the write is refused if the Note changed since; left out, it applies to the latest content. Answers the new contentVersion.",
        scope: McpScope.Resources,
      },
    })
    .mutation<{ contentVersion: number }>(async ({ ctx, input }) => ({
      contentVersion: await writeNoteMarkdown(ctx, ctx.resource, input),
    })),
});
