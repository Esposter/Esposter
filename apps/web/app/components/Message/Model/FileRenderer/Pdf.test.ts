// @vitest-environment nuxt
import type { FileEntity } from "@esposter/db-schema";

import type { loadPdfDocument } from "@/services/pdf/loadPdfDocument";
import type { loadPdfViewer } from "@/services/pdf/loadPdfViewer";

import { MimeType } from "#shared/models/file/MimeType";
import MessageModelFileRendererPdf from "@/components/Message/Model/FileRenderer/Pdf.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// Neither the thumbnail nor the viewer draws in this file, which asserts the shell around them and when the dialog
// Exists. The source never answers, so each component stays at its loading state
vi.mock(import("@/services/pdf/loadPdfViewer"), () => ({
  loadPdfViewer: vi.fn<typeof loadPdfViewer>(() => new Promise(() => {})),
}));
vi.mock(import("@/services/pdf/loadPdfDocument"), () => ({
  loadPdfDocument: vi.fn<typeof loadPdfDocument>(() => new Promise(() => {})),
}));

describe("messageModelFileRendererPdf", () => {
  const filename = "filename";
  const file: Pick<FileEntity, "filename" | "hasThumbnail" | "id" | "isSpoiler" | "mimetype" | "size"> = {
    filename,
    hasThumbnail: false,
    id: crypto.randomUUID(),
    isSpoiler: false,
    mimetype: MimeType.Pdf,
    size: 1,
  };
  const mountPdf = (isPreview: boolean) =>
    mountSuspended(MessageModelFileRendererPdf, { attachTo: document.body, props: { file, isPreview, url: "" } });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // A preview is a thumbnail inside a message row — clicking it opens the message, not a viewer, so the dialog
  // Must not exist to be opened at all
  test("a preview opens nothing", async () => {
    expect.hasAssertions();

    await mountPdf(true);

    expect(document.body.querySelector("dialog")).toBeNull();
  });

  // The viewer is the whole body, so the dialog is action-less — it has nothing to confirm and nothing to cancel, and
  // Its title bar still gives it a title and a way out that is not clicking the backdrop
  test("opening the viewer", async () => {
    expect.hasAssertions();

    const component = await mountPdf(false);
    await component.find("canvas").trigger("click");

    expect(document.body.querySelector("dialog h2")?.textContent).toBe(filename);
    expect(document.body.querySelector("dialog footer")).toBeNull();
    expect(document.body.querySelector('dialog [aria-label="Close"]')).not.toBeNull();
  });
});
