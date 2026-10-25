import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { noteRouter } from "#server/trpc/routers/note";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { MimeType } from "#shared/models/file/MimeType";
import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { AzureContainer, ResourceType } from "@esposter/db-schema";
import { getBlobUrl, getMockSasUrl } from "azure-mock";
import { beforeAll, describe, expect, test } from "vitest";

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

  test("choosing an image from the menu adds it to the note", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const sasEntities = await caller.generateUploadFileSasEntities({
      files: [{ hash, mimetype, size }],
      id: newResource.id,
    });

    const blobName = `${getFilesDirectoryName(newResource.id)}/${hash}`;

    expect(sasEntities).toStrictEqual([
      { id: hash, isHeld: false, sasUrl: getMockSasUrl(getBlobUrl(AzureContainer.ResourceAssets, blobName), "w", "b") },
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
});
