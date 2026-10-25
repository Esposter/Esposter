// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useEmailEditorStore } from "@/store/emailEditor";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useEmailEditorStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Email });
  let content: EmailEditor;
  let savedContents: unknown[];
  let saveResourceContent: ReturnType<typeof vi.fn<() => ResourceInResource>>;

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    content = new EmailEditor({ content: [], root: { props: {} } });
    savedContents = [];
    saveResourceContent = vi.fn<() => ResourceInResource>(() => createResource(1));
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.email.readResourceContent.query(() => content);
    trpcMsw.email.readResourcePublication.query(() => undefined);
    trpcMsw.email.saveResourceContent.mutation(({ input }) => {
      savedContents.push({ content: input.content.content, id: input.content.id });
      return saveResourceContent();
    });
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  test("an email edit is saved as the content's body and head, under the loaded identity", async () => {
    expect.hasAssertions();

    const emailEditorStore = useEmailEditorStore();
    const { loadContent, saveEmail } = emailEditorStore;
    await loadContent();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setEmailDocument } = pageBuilderDocumentStore;
    setEmailDocument(resourceId, emailKind, { content: [], root: { props: { attributes: {} } } });
    await saveEmail(resourceId);

    expect(savedContents[0]).toStrictEqual({ content: [], id: content.id });
  });

  test("carries the dataset binding across an email save", async () => {
    expect.hasAssertions();

    const datasetReference = { id: crypto.randomUUID(), type: DatasetProviderType.Sheet };
    content = new EmailEditor({ content: [], datasetReference, root: { props: {} } });
    const emailEditorStore = useEmailEditorStore();
    const { loadContent, saveEmail } = emailEditorStore;
    await loadContent();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setEmailDocument } = pageBuilderDocumentStore;
    setEmailDocument(resourceId, emailKind, { content: [], root: { props: {} } });
    await saveEmail(resourceId);

    expect(emailEditorStore.datasetReference).toStrictEqual(datasetReference);
  });

  test("skips the store echo that follows the load", async () => {
    expect.hasAssertions();

    const emailEditorStore = useEmailEditorStore();
    const { loadContent, saveEmail } = emailEditorStore;
    await loadContent();
    await saveEmail(resourceId);

    expect(saveResourceContent).not.toHaveBeenCalled();
  });
});
