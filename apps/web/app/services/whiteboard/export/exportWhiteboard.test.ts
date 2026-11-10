// @vitest-environment nuxt
import type { ImageElement, PositionedDocument } from "vue-block-editor-headless";

import { MimeType } from "#shared/models/file/MimeType";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { WhiteboardExportFormat } from "@/models/whiteboard/WhiteboardExportFormat";
import { rasterizeSvg } from "@/services/capture/rasterizeSvg";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { exportWhiteboard } from "@/services/whiteboard/export/exportWhiteboard";
import { useAlertStore } from "@/store/alert";
import { useResourceStore } from "@/store/resource";
import { getResourceFileBlobName, ResourceType } from "@esposter/db-schema";
import { downloadFile } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { assert, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { getExportBounds, PositionedElementType, ShapeKind, toPositionedSvg } from "vue-block-editor-headless";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

// The canvas is missing from the test environment, so the rasterizer is replaced by one that resolves the PNG the test gives it
vi.mock(import("@/services/capture/rasterizeSvg"), () => ({ rasterizeSvg: vi.fn<typeof rasterizeSvg>() }));

describe(exportWhiteboard, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const resourceName = "a";
  const PROCESS_ID = crypto.randomUUID();
  const IMAGE_ID = crypto.randomUUID();
  const IMAGE_FILE_ID = "5e1a7c3b9d2f4e6a8b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a";
  const positionedDocument: PositionedDocument = {
    elements: [
      {
        fill: "#ffffff",
        height: 100,
        id: PROCESS_ID,
        kind: ShapeKind.Process,
        text: "a",
        type: PositionedElementType.Shape,
        width: 100,
        x: 0,
        y: 0,
      },
    ],
  };

  beforeEach(() => {
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    resource.value = createResourceListItem({ id: resourceId, name: resourceName, type: ResourceType.Whiteboard });
  });

  test("the whiteboard exports to PNG", async () => {
    expect.hasAssertions();

    trpcMsw.whiteboard.readResourceContent.query(() => ({ elements: positionedDocument.elements }));
    const png = new Blob([], { type: MimeType.Png });
    vi.mocked(rasterizeSvg).mockResolvedValueOnce(png);

    await exportWhiteboard(WhiteboardExportFormat.Png);

    // The rasterizer is given the SVG the SVG export writes, at the size of the export's bounds
    const [svgBlob] = vi.mocked(rasterizeSvg).mock.lastCall ?? [];
    assert.instanceOf(svgBlob, Blob);
    await expect(svgBlob.text()).resolves.toBe(toPositionedSvg(positionedDocument, () => ""));
    const { height, width } = getExportBounds(positionedDocument);
    expect(rasterizeSvg).toHaveBeenCalledExactlyOnceWith(svgBlob, width, height);
    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(`${resourceName}.png`, png, MimeType.Png);
  });

  test("a whiteboard whose content cannot be read is alerted to the owner, and the export does not reject", async () => {
    expect.hasAssertions();

    trpcMsw.whiteboard.readResourceContent.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });

    await exportWhiteboard(WhiteboardExportFormat.Svg);

    const alertStore = useAlertStore();

    expect(alertStore.alerts.map(({ text, type }) => ({ text, type }))).toStrictEqual([{ text: " ", type: "error" }]);
  });

  test("an image that fails to load is left out of the export and reported", async () => {
    expect.hasAssertions();

    const imageElement: ImageElement = {
      fileId: IMAGE_FILE_ID,
      height: 100,
      id: IMAGE_ID,
      type: PositionedElementType.Image,
      width: 100,
      x: 200,
      y: 0,
    };
    trpcMsw.whiteboard.readResourceContent.query(() => ({ elements: [...positionedDocument.elements, imageElement] }));
    // The image's file is missing from storage, so its fetch is answered not found, and every other request passes through
    const nuxtFetch = globalThis.fetch;
    const imageAssetUrl = getResourceAssetUrl(getResourceFileBlobName(resourceId, IMAGE_FILE_ID));
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((input, init) =>
        (input instanceof Request ? input.url : String(input)).endsWith(imageAssetUrl)
          ? Promise.resolve(new Response(undefined, { status: 404 }))
          : nuxtFetch(input, init),
      );
    onTestFinished(() => {
      fetchSpy.mockRestore();
    });
    const png = new Blob([], { type: MimeType.Png });
    vi.mocked(rasterizeSvg).mockResolvedValueOnce(png);

    await exportWhiteboard(WhiteboardExportFormat.Png);

    // The file is drawn from the whiteboard without the failed image's element, and the owner is told how many were left out
    const [svgBlob] = vi.mocked(rasterizeSvg).mock.lastCall ?? [];
    assert.instanceOf(svgBlob, Blob);
    await expect(svgBlob.text()).resolves.toBe(toPositionedSvg(positionedDocument, () => ""));
    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(`${resourceName}.png`, png, MimeType.Png);
    const alertStore = useAlertStore();

    expect(alertStore.alerts.map(({ text, type }) => ({ text, type }))).toStrictEqual([
      { text: "1 image could not be loaded and left out of the export", type: "warning" },
    ]);
  });
});
