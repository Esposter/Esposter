// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";
import type { Editor, ProjectData } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { ResourceType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useEmailEditorStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const html = "";
  const projectData: ProjectData = { pages: [{ component: "" }] };
  // Only the MJML compile command is reached
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

    const emailEditorStore = useEmailEditorStore();
    const { readEmailEditor, saveEmailEditor } = emailEditorStore;
    await readEmailEditor();
    await saveEmailEditor(projectData, editor);

    expect(savedContentIds).toStrictEqual([content.id]);
  });

  test("skips the store echo that follows the load", async () => {
    expect.hasAssertions();

    content = new EmailEditor({ ...projectData, html });
    const emailEditorStore = useEmailEditorStore();
    const { readEmailEditor, saveEmailEditor } = emailEditorStore;
    await readEmailEditor();
    await saveEmailEditor(projectData, editor);

    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("skips a save that changed nothing since the last one", async () => {
    expect.hasAssertions();

    const emailEditorStore = useEmailEditorStore();
    const { readEmailEditor, saveEmailEditor } = emailEditorStore;
    await readEmailEditor();
    await saveEmailEditor(projectData, editor);
    await saveEmailEditor(projectData, editor);

    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });

  test("keeps the last compiled html and tells the author when a compile fails", async () => {
    expect.hasAssertions();

    const lastHtml = "<p>last</p>";
    content = new EmailEditor({ ...projectData, html: lastHtml });
    const failingEditor = {
      runCommand: () => {
        throw new Error("compile");
      },
    } as unknown as Editor;
    const savedHtmls: string[] = [];
    server.use(
      trpcMsw.email.saveResourceContent.mutation(({ input }) => {
        savedHtmls.push(input.content.html);
        return saveResourceContent();
      }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const emailEditorStore = useEmailEditorStore();
    const { readEmailEditor, saveEmailEditor } = emailEditorStore;
    await readEmailEditor();
    await saveEmailEditor({ pages: [{ component: "changed" }] }, failingEditor);

    expect(savedHtmls).toStrictEqual([lastHtml]);
    expect(alerts.value.map(({ type }) => type)).toStrictEqual(["warning"]);
  });
});
