// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";
import type { Editor, ProjectData } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useEmailEditorStore } from "@/store/emailEditor";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useEmailEditorStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const html = "<html></html>";
  const projectData: ProjectData = { pages: [{ component: "<div>page</div>" }] };
  // Only the MJML compile command is reached, and a failed compile is its own (already covered) fallback path
  const editor = { runCommand: () => ({ html }) } as unknown as Editor;
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Email });
  let content: EmailEditor;
  let savedContentIds: string[];
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    content = new EmailEditor();
    savedContentIds = [];
    saveResourceContent = vi.fn<() => Resource>(() => createResource(1));
    server.use(
      trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null })),
      trpcMsw.email.readResourceContent.query(() => content),
      trpcMsw.email.readResourcePublication.query(() => undefined),
      trpcMsw.email.saveResourceContent.mutation(({ input }) => {
        savedContentIds.push(input.content.id);
        return saveResourceContent();
      }),
    );
  });

  test("carries the loaded content identity into the save", async () => {
    expect.hasAssertions();

    const { readEmailEditor, saveEmailEditor } = useEmailEditorStore();
    await readEmailEditor();
    await saveEmailEditor(projectData, editor);

    expect(takeOne(savedContentIds)).toBe(content.id);
  });

  test("skips the store echo that follows the load", async () => {
    expect.hasAssertions();

    content = new EmailEditor({ ...projectData, html });
    const { readEmailEditor, saveEmailEditor } = useEmailEditorStore();
    await readEmailEditor();
    await saveEmailEditor(projectData, editor);

    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("skips a save that changed nothing since the last one", async () => {
    expect.hasAssertions();

    const { readEmailEditor, saveEmailEditor } = useEmailEditorStore();
    await readEmailEditor();
    await saveEmailEditor(projectData, editor);
    await saveEmailEditor(projectData, editor);

    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });
});
