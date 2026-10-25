// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceBlueprintEditor from "@/components/Resource/Blueprint/Editor.vue";
import { showOpenFilePicker } from "@/services/file/showOpenFilePicker";
import { createEmptyBlueprint } from "@/services/resource/blueprint/createEmptyBlueprint";
import { PortableFormatMap } from "@/services/resource/PortableFormatMap";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/file/showOpenFilePicker"), () => ({
  showOpenFilePicker: vi.fn<typeof showOpenFilePicker>(),
}));

describe("resourceBlueprintEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Blueprint }),
      publication: null,
    }));
    trpcMsw.blueprint.readResourceContent.query(() => createEmptyBlueprint());
    trpcMsw.resource.saveResourceRevision.mutation(() => 1);
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  // A deploy runs the saved manifest, so while the text on screen differs from it the deploy would run something
  // Other than what the owner is looking at
  test("keeps Deploy from running while the manifest has unsaved edits", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceBlueprintEditor);
    const findDeployButton = () => component.findAll("button").find((button) => button.text() === "Deploy");
    const deployButton = findDeployButton();
    assert.exists(deployButton);

    expect(deployButton.attributes("disabled")).toBeUndefined();

    await component.get("textarea").setValue("{}");
    const dirtyDeployButton = findDeployButton();
    assert.exists(dirtyDeployButton);

    expect(dirtyDeployButton.attributes("disabled")).toBeDefined();
  });

  // An imported manifest is shown as text the owner has not saved, in place of the text the Editor held
  test("Importing a manifest fills the editor unsaved", async () => {
    expect.hasAssertions();

    const importedManifest = { entries: [{ key: "notes", name: "Kickoff", type: ResourceType.Note }], parameters: [] };
    const importedJson = JSON.stringify(importedManifest, null, 2);
    vi.mocked(showOpenFilePicker).mockResolvedValue([
      { getFile: () => Promise.resolve(new File([importedJson], "Launch.json")) },
    ] as never);
    const component = await mountSuspended(ResourceBlueprintEditor);
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.import);
    await manifestFormat.import();
    await flushPromises();

    expect(component.get("textarea").element.value).toBe(importedJson);
  });

  // Save is what makes an imported manifest the saved one, and until it does Deploy stays off
  test("Deploy stays disabled until an imported manifest is saved", async () => {
    expect.hasAssertions();

    const importedManifest = { entries: [{ key: "notes", name: "Kickoff", type: ResourceType.Note }], parameters: [] };
    vi.mocked(showOpenFilePicker).mockResolvedValue([
      { getFile: () => Promise.resolve(new File([JSON.stringify(importedManifest)], "Launch.json")) },
    ] as never);
    const { promise: isContentSaved, resolve: onContentSaved } = Promise.withResolvers<void>();
    trpcMsw.blueprint.saveResourceContent.mutation(() => {
      onContentSaved();
      return createResourceListItem({ id: resourceId, type: ResourceType.Blueprint });
    });
    const component = await mountSuspended(ResourceBlueprintEditor);
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.import);
    await manifestFormat.import();
    await flushPromises();
    const findDeployButton = () => component.findAll("button").find((button) => button.text() === "Deploy");
    const dirtyDeployButton = findDeployButton();
    assert.exists(dirtyDeployButton);

    expect(dirtyDeployButton.attributes("disabled")).toBeDefined();

    const saveButton = component.findAll("button").find((button) => button.text() === "Save");
    assert.exists(saveButton);
    await saveButton.trigger("click");
    await isContentSaved;
    await flushPromises();
    const savedDeployButton = findDeployButton();
    assert.exists(savedDeployButton);

    expect(savedDeployButton.attributes("disabled")).toBeUndefined();
  });

  // The import takes a revision of the manifest it replaces before it fills the Editor, so the save that follows
  // always has that manifest in history to return to
  test("Saving an imported manifest keeps the previous one in version history", async () => {
    expect.hasAssertions();

    const importedManifest = { entries: [{ key: "notes", name: "Kickoff", type: ResourceType.Note }], parameters: [] };
    vi.mocked(showOpenFilePicker).mockResolvedValue([
      { getFile: () => Promise.resolve(new File([JSON.stringify(importedManifest)], "Launch.json")) },
    ] as never);
    const writes: string[] = [];
    trpcMsw.resource.saveResourceRevision.mutation(() => {
      writes.push("revision");
      return 1;
    });
    const { promise: isContentSaved, resolve: onContentSaved } = Promise.withResolvers<void>();
    trpcMsw.blueprint.saveResourceContent.mutation(() => {
      writes.push("save");
      onContentSaved();
      return createResourceListItem({ id: resourceId, type: ResourceType.Blueprint });
    });
    const component = await mountSuspended(ResourceBlueprintEditor);
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.import);
    await manifestFormat.import();
    await flushPromises();
    const saveButton = component.findAll("button").find((button) => button.text() === "Save");
    assert.exists(saveButton);
    await saveButton.trigger("click");
    await isContentSaved;

    expect(writes).toStrictEqual(["revision", "save"]);
  });
});
