import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import { noteRouter } from "@@/server/trpc/routers/note";
import { setupResourceSuite } from "@@/server/trpc/routers/setupResourceSuite.test";
import { ResourceType } from "@esposter/db-schema";
import { beforeAll, describe, expect, test } from "vitest";

describe("noteRouter", () => {
  const { getCaller } = setupResourceSuite(noteRouter);
  let caller: DecorateRouterRecord<TRPCRouter["note"]>;
  const name = "name";
  const note = { doc: EMPTY_NOTE_DOC };

  beforeAll(() => {
    caller = getCaller();
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
