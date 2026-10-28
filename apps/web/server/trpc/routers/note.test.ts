import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { noteRouter } from "#server/trpc/routers/note";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { MimeType } from "#shared/models/file/MimeType";
import { NoteMarkdownWriteMode } from "#shared/models/resource/note/NoteMarkdownWriteMode";
import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { AzureContainer, ResourceType, WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { getBlobUrl, getMockSasUrl } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe("noteRouter", () => {
  const { getCaller } = setupResourceSuite(noteRouter);
  let caller: DecorateRouterRecord<TRPCRouter["note"]>;
  const name = "name";
  const note = { doc: EMPTY_NOTE_DOC };
  const hash = "a".repeat(64);
  const mimetype = MimeType.Png;
  const size = 1;

  beforeAll(() => {
    caller = getCaller();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("an image upload is given a write address under the resource's files directory", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const newResource = await caller.createResource({ name });
    const sasEntities = await caller.generateUploadFileSasEntities({
      files: [{ hash, mimetype, size }],
      id: newResource.id,
    });

    const blobName = `${getFilesDirectoryName(newResource.id)}/${hash}`;
    const blobUrl = getBlobUrl(AzureContainer.ResourceAssets, blobName);
    const expiresOn = new Date(WRITE_SAS_DURATION_MS);

    expect(sasEntities).toStrictEqual([
      { id: hash, isHeld: false, sasUrl: getMockSasUrl(blobUrl, "w", "b", expiresOn) },
    ]);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Note);

    await caller.saveResourceContent({ content: note, contentVersion: newResource.contentVersion, id: newResource.id });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(note);
  });

  test("serves the published snapshot to the public view", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({ content: note, contentVersion: newResource.contentVersion, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content).toStrictEqual(note);
  });

  // A Note saved with one paragraph, for a Markdown write to replace or follow
  const oldNote = { doc: { content: [{ content: [{ text: "old", type: "text" }], type: "paragraph" }], type: "doc" } };

  test("a Note written from Markdown replaces its content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: oldNote,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await caller.writeNoteMarkdown({
      id: newResource.id,
      markdown: "# Title\n\n[link](https://example.com)",
      mode: NoteMarkdownWriteMode.Replace,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content?.doc.content).toStrictEqual([
      { attrs: { level: 1 }, content: [{ marks: [], text: "Title", type: "text" }], type: "heading" },
      {
        content: [{ marks: [{ attrs: { href: "https://example.com" }, type: "link" }], text: "link", type: "text" }],
        type: "paragraph",
      },
    ]);
  });

  test("a Note written from Markdown appends to its content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: oldNote,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await caller.writeNoteMarkdown({ id: newResource.id, markdown: "## Next", mode: NoteMarkdownWriteMode.Append });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content?.doc.content).toStrictEqual([
      { content: [{ text: "old", type: "text" }], type: "paragraph" },
      { attrs: { level: 2 }, content: [{ marks: [], text: "Next", type: "text" }], type: "heading" },
    ]);
  });
});
