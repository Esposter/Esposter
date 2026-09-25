// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";
import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { ResourceType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useWebpageEditorStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const projectData: ProjectData = { pages: [{ component: "" }] };
  const render = { css: "", html: "" };
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Webpage });
  let content: WebpageEditor;
  let savedContentIds: string[];
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;

  beforeEach(async () => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    content = new WebpageEditor();
    savedContentIds = [];
    saveResourceContent = vi.fn<() => Resource>(() => createResource(1));
    server.use(
      trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null })),
      trpcMsw.webpage.readResourceContent.query(() => content),
      trpcMsw.webpage.readResourcePublication.query(() => undefined),
      trpcMsw.webpage.saveResourceContent.mutation(({ input }) => {
        savedContentIds.push(input.content.id);
        return saveResourceContent();
      }),
    );
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  test("carries the loaded content identity into the save", async () => {
    expect.hasAssertions();

    const webpageEditorStore = useWebpageEditorStore();
    const { readWebpageEditor, saveWebpageEditor } = webpageEditorStore;
    await readWebpageEditor();
    await saveWebpageEditor(projectData, render);

    expect(savedContentIds).toStrictEqual([content.id]);
  });

  test("skips the store echo that follows the load", async () => {
    expect.hasAssertions();

    content = new WebpageEditor({ ...projectData, ...render });
    const webpageEditorStore = useWebpageEditorStore();
    const { readWebpageEditor, saveWebpageEditor } = webpageEditorStore;
    await readWebpageEditor();
    await saveWebpageEditor(projectData, render);

    expect(saveResourceContent).not.toHaveBeenCalled();
  });
});
