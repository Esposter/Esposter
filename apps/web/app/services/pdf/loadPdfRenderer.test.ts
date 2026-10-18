// @vitest-environment nuxt
import { loadPdfRenderer } from "@/services/pdf/loadPdfRenderer";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/pdf/loadPdfViewer"), () => ({ loadPdfViewer: vi.fn<typeof loadPdfViewer>() }));

describe(loadPdfRenderer, () => {
  // An attachment loads its renderer as it mounts, before any viewer is opened, so the viewer's module waits for its viewer
  test("the renderer loads without the viewer's module", async () => {
    expect.hasAssertions();

    await loadPdfRenderer();

    expect(loadPdfViewer).not.toHaveBeenCalled();
  });
});
