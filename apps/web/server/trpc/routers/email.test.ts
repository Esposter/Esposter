import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { emailRouter } from "@@/server/trpc/routers/email";
import { DatabaseEntityType, resources, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("emailRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["email"]>;
  const name = "name";
  const html = "html";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(emailRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Email);

    // The dataset binding and the save-time compiled html are part of the round-trip
    // So the schema provably preserves them
    const emailEditor = new EmailEditor({
      datasetReference: { id: crypto.randomUUID(), type: DatasetProviderType.SurveyResponses },
      html,
    });
    await caller.saveResourceContent({
      content: emailEditor,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(emailEditor)));
  });

  test("rejects publishing an email without compiled html", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new EmailEditor(),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await expect(caller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Resource, "cannot publish email without compiled html").message}]`,
    );
  });

  test("strips the owner-only dataset binding from the published snapshot", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new EmailEditor({
        datasetReference: { id: crypto.randomUUID(), type: DatasetProviderType.SurveyResponses },
        html,
      }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.datasetReference).toBeUndefined();
    expect(publishedContent.content.html).toBe(html);
  });

  test("serves the compiled html to the published web view", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new EmailEditor({ html }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content.html).toBe(html);
  });
});
