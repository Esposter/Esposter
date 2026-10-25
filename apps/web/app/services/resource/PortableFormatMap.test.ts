// @vitest-environment nuxt
import type { JSONContent } from "@tiptap/core";

import { MimeType } from "#shared/models/file/MimeType";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { showOpenFilePicker } from "@/services/file/showOpenFilePicker";
import { getResourceBladeItems } from "@/services/resource/getResourceBladeItems";
import { PortableFormatMap } from "@/services/resource/PortableFormatMap";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { downloadFile, noop } from "@esposter/shared";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

vi.mock(import("@/services/file/showOpenFilePicker"), () => ({
  showOpenFilePicker: vi.fn<typeof showOpenFilePicker>(),
}));

describe("PortableFormatMap", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const resource = createResourceListItem({ id: resourceId, name: "Meeting", type: ResourceType.Note });
  const doc: JSONContent = {
    content: [
      { attrs: { level: 1 }, content: [{ text: "Meeting", type: "text" }], type: "heading" },
      {
        content: [{ content: [{ content: [{ text: "one", type: "text" }], type: "paragraph" }], type: "listItem" }],
        type: "bulletList",
      },
    ],
    type: "doc",
  };

  beforeEach(() => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.note.readResourceContent.query(() => ({ doc }));
  });

  // The export is the note as it is held, so a reader sees the same heading and list in the file as in the note
  test("Exporting a note downloads a Markdown file", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const [markdownFormat] = PortableFormatMap[ResourceType.Note];
    assert.exists(markdownFormat?.export);
    await markdownFormat.export();

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith("Meeting.md", "# Meeting\n\n- one\n", MimeType.Markdown);
  });

  // A file over the app's file limit is refused before it is read, so no preview opens over the note for it
  test("An import over the file size limit opens no preview", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const oversizedFile = new File([new Uint8Array(MAX_FILE_REQUEST_SIZE + 1)], "Meeting.md");
    const readFile = vi.spyOn(oversizedFile, "text");
    vi.mocked(showOpenFilePicker).mockResolvedValue([{ getFile: () => Promise.resolve(oversizedFile) }] as never);
    const [markdownFormat] = PortableFormatMap[ResourceType.Note];
    assert.exists(markdownFormat?.import);
    await markdownFormat.import();

    expect(readFile).not.toHaveBeenCalled();
  });

  // The overflow menu takes its import and export commands from the formats, so a note gets both beside its others
  test("The overflow menu lists the Markdown commands", () => {
    expect.hasAssertions();

    const { exportFormats, importFormats } = usePortableFormats(() => resource);
    const titles = getResourceBladeItems(resource, {
      commands: {
        delete: noop,
        duplicate: noop,
        exportDatasetCsv: noop,
        read: noop,
        rename: noop,
        unpublish: noop,
        versionHistory: noop,
      },
      exportFormats: exportFormats.value,
      importFormats: importFormats.value,
      isDuplicatePending: false,
      isPending: false,
      isPublicationPending: false,
      isPublished: false,
    }).map(({ title }) => title);

    expect(titles).toContain("Export Markdown");
    expect(titles).toContain("Import Markdown");
  });
});
