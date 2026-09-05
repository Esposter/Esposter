// @vitest-environment nuxt
import type { FileEntity } from "@esposter/db-schema";

import { MimeType } from "#shared/models/file/MimeType";
import MessageModelFileRendererPdf from "@/components/Message/Model/FileRenderer/Pdf.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// Both viewers pull in SVG and worker assets vitest cannot resolve, and neither renders anything this file asserts
// On — what is under test is the shell around them and when it exists. The casts are the one thing a stub of a
// Third-party component cannot avoid: the real types are full instance types carrying two dozen props and slots,
// And a double that implemented them would be the library rather than a stand-in for it
vi.mock(import("@vue-pdf-viewer/viewer"), () => ({
  VPdfViewer: defineComponent({
    render: () => h("div"),
  }) as unknown as (typeof import("@vue-pdf-viewer/viewer"))["VPdfViewer"],
}));
vi.mock(import("vue-pdf-embed"), () => ({
  default: defineComponent({
    render: () => h("div", { class: "pdf-embed" }),
  }) as unknown as (typeof import("vue-pdf-embed"))["default"],
}));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- a `?url` asset has no module type to import
vi.mock("pdfjs-dist/build/pdf.worker?url", () => ({ default: "" }));

// The viewer is the whole body, so the dialog is action-less — it has nothing to confirm and nothing to cancel.
// `StyledDialog` still owes it the two things a bare `v-dialog` would not give: a title, and a way out that is
// Not clicking the backdrop
describe("messageModelFileRendererPdf", () => {
  let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined;
  const filename = "filename.pdf";
  const file: Pick<FileEntity, "filename" | "hasThumbnail" | "id" | "mimetype" | "size"> = {
    filename,
    hasThumbnail: false,
    id: crypto.randomUUID(),
    mimetype: MimeType.Pdf,
    size: 1,
  };
  const mountPdf = async (isPreview: boolean) => {
    wrapper = await mountSuspended(MessageModelFileRendererPdf, {
      attachTo: document.body,
      props: { file, isPreview, url: "https://example.com/file.pdf" },
    });
    return wrapper;
  };

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
  });

  // A preview is a thumbnail inside a message row — clicking it opens the message, not a viewer, so the dialog
  // Must not exist to be opened at all
  test("mounts no dialog in preview", async () => {
    expect.hasAssertions();

    await mountPdf(true);

    expect(document.body.querySelector(".v-dialog")).toBeNull();
  });

  test("opens a titled dialog with a close button and no actions row", async () => {
    expect.hasAssertions();

    const component = await mountPdf(false);
    await component.find(".pdf-embed").trigger("click");

    expect(document.body.textContent).toContain(filename);
    expect(document.body.querySelector(".v-card-actions")).toBeNull();
    expect(document.body.querySelector('[aria-label="Close"], button .mdi-close')).not.toBeNull();
  });
});
