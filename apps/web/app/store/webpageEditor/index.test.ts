// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { ResourceType } from "@esposter/db-schema";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useWebpageEditorStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Webpage });
  let content: WebpageEditor;
  let savedContents: unknown[];
  let saveResourceContent: ReturnType<typeof vi.fn<() => ResourceInResource>>;

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    content = new WebpageEditor();
    savedContents = [];
    saveResourceContent = vi.fn<() => ResourceInResource>(() => createResource(1));
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.webpage.readResourceContent.query(() => content);
    trpcMsw.webpage.readResourcePublication.query(() => undefined);
    trpcMsw.webpage.saveResourceContent.mutation(({ input }) => {
      savedContents.push({ content: input.content.content, id: input.content.id });
      return saveResourceContent();
    });
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  test("a page edit is saved as the content's tree and root, under the loaded identity", async () => {
    expect.hasAssertions();

    const webpageEditorStore = useWebpageEditorStore();
    const { loadContent, saveWebpage } = webpageEditorStore;
    await loadContent();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, {
      content: [{ props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button }],
      root: TEST_ROOT,
    });
    await saveWebpage(resourceId);

    expect(savedContents[0]).toStrictEqual({
      content: [{ props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button }],
      id: content.id,
    });
  });

  test("carries the share preview across a page save", async () => {
    expect.hasAssertions();

    const description = "a";
    content = new WebpageEditor({ description, imageUrl: TEST_URL });
    const webpageEditorStore = useWebpageEditorStore();
    const { loadContent, saveWebpage } = webpageEditorStore;
    await loadContent();
    await saveWebpage(resourceId);

    expect(webpageEditorStore.webpageEditor.description).toBe(description);
    expect(webpageEditorStore.webpageEditor.imageUrl).toBe(TEST_URL);
  });

  test("skips the store echo that follows the load", async () => {
    expect.hasAssertions();

    const webpageEditorStore = useWebpageEditorStore();
    const { loadContent, saveWebpage } = webpageEditorStore;
    await loadContent();
    await saveWebpage(resourceId);

    expect(saveResourceContent).not.toHaveBeenCalled();
  });
});
