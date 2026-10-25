// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { showOpenFilePicker } from "@/services/file/showOpenFilePicker";
import { createBlueprintPortableFormat } from "@/services/resource/createBlueprintPortableFormat";
import { PortableFormatMap } from "@/services/resource/PortableFormatMap";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useResourceStore } from "@/store/resource";
import { useBlueprintStore } from "@/store/resource/blueprint";
import { ResourceType } from "@esposter/db-schema";
import { downloadFile } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

vi.mock(import("@/services/file/showOpenFilePicker"), () => ({
  showOpenFilePicker: vi.fn<typeof showOpenFilePicker>(),
}));

describe(createBlueprintPortableFormat, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const resource = createResourceListItem({ id: resourceId, name: "Launch", type: ResourceType.Blueprint });
  const savedManifest = { entries: [{ key: "notes", name: "Kickoff", type: ResourceType.Note }], parameters: [] };
  const savedJson = JSON.stringify(savedManifest, null, 2);

  beforeEach(() => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.blueprint.readResourceContent.query(() => savedManifest);
    trpcMsw.resource.saveResourceRevision.mutation(() => 1);
  });

  // The file is the saved manifest, so it is what a deploy would create and never the text on screen
  test("Exporting downloads the saved manifest", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.export);
    await manifestFormat.export();

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith("Launch.json", savedJson, MimeType.Json);
  });

  // Text the owner has not saved is not what Deploy runs, so the file leaves it out
  test("Unsaved editor text is not exported", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const blueprintStore = useBlueprintStore();
    const { loadContent } = blueprintStore;
    // The Editor reads the content before the owner can type, so the text is set over a loaded manifest
    await loadContent();
    const { manifestJson } = storeToRefs(blueprintStore);
    manifestJson.value = "{}";
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.export);
    await manifestFormat.export();

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith("Launch.json", savedJson, MimeType.Json);
  });

  // The schema the Editor's Save checks is the one a file must pass, so a file Save would refuse never reaches the text
  test("An invalid manifest file is refused and changes nothing", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const invalidFile = new File(
      [JSON.stringify({ entries: [{ key: "notes", name: "Kickoff", type: "Unknown" }] })],
      "Launch.json",
    );
    vi.mocked(showOpenFilePicker).mockResolvedValue([{ getFile: () => Promise.resolve(invalidFile) }] as never);
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.import);
    await manifestFormat.import();
    await flushPromises();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { manifestJson } = storeToRefs(useBlueprintStore());

    expect(alerts.value.map(({ type }) => type)).toStrictEqual(["error"]);
    expect(manifestJson.value).toBe(savedJson);
  });

  // The size check runs before the file is read, so an oversized file costs no read and changes no text
  test("A manifest file over the limit is refused before it is read", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const oversizedFile = new File([new Uint8Array(MAX_FILE_REQUEST_SIZE + 1)], "Launch.json");
    const readFile = vi.spyOn(oversizedFile, "text");
    vi.mocked(showOpenFilePicker).mockResolvedValue([{ getFile: () => Promise.resolve(oversizedFile) }] as never);
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.import);
    await manifestFormat.import();
    const { manifestJson } = storeToRefs(useBlueprintStore());

    expect(readFile).not.toHaveBeenCalled();
    expect(manifestJson.value).toBe(savedJson);
  });

  // The export is the file an import reads back, so a copy of a manifest between accounts is the manifest that was saved
  test("A manifest exported and imported again is unchanged", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const [manifestFormat] = PortableFormatMap[ResourceType.Blueprint];
    assert.exists(manifestFormat?.export);
    assert.exists(manifestFormat.import);
    await manifestFormat.export();
    const exportedFile = vi.mocked(downloadFile).mock.lastCall;
    assert.exists(exportedFile);
    const [, exportedJson] = exportedFile;
    vi.mocked(showOpenFilePicker).mockResolvedValue([
      { getFile: () => Promise.resolve(new File([exportedJson], "Launch.json")) },
    ] as never);
    await manifestFormat.import();
    const { manifestJson } = storeToRefs(useBlueprintStore());

    expect(manifestJson.value).toBe(savedJson);
  });
});
