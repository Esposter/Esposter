// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";
import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// GrapesJS project data carries only GrapesJS's own keys, so a content class rebuilt from it alone re-runs its
// Field initializers — minting a fresh identity, and a fresh dirty-check shape, on every autosave tick
describe(useWebpageEditorStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const projectData: ProjectData = { pages: [{ component: "<div>page</div>" }] };
  const render = { css: ".page {}", html: "<div>page</div>" };
  const createResource = (contentVersion = 0) =>
    ({
      contentVersion,
      id: resourceId,
      name: "name",
      type: ResourceType.Webpage,
      updatedAt: new Date(0),
    }) as Resource;
  let content: WebpageEditor;
  let savedContentIds: string[];
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;

  beforeEach(() => {
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
  });

  test("carries the loaded content identity into the save", async () => {
    expect.hasAssertions();

    const { readWebpageEditor, saveWebpageEditor } = useWebpageEditorStore();
    await readWebpageEditor();
    await saveWebpageEditor(projectData, render);

    expect(takeOne(savedContentIds)).toBe(content.id);
  });

  // GrapesJS stores as soon as it has finished loading, so the first save of a session is an echo of what was
  // Just read. Unless the load seeds the dirty check, that echo counts as a change: it bumps contentVersion for
  // Content nobody edited, and every other client holding the page open is told its version is stale
  test("skips the store echo that follows the load", async () => {
    expect.hasAssertions();

    content = new WebpageEditor({ ...projectData, ...render });
    const { readWebpageEditor, saveWebpageEditor } = useWebpageEditorStore();
    await readWebpageEditor();
    await saveWebpageEditor(projectData, render);

    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("skips a save that changed nothing since the last one", async () => {
    expect.hasAssertions();

    const { readWebpageEditor, saveWebpageEditor } = useWebpageEditorStore();
    await readWebpageEditor();
    await saveWebpageEditor(projectData, render);
    await saveWebpageEditor(projectData, render);

    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });
});
