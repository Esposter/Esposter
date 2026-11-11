import { getLinkPreviewResponse } from "#src/services/message/getLinkPreviewResponse";
import { getLinkPreview } from "link-preview-js";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("link-preview-js"), () => ({
  getLinkPreview: vi.fn<typeof getLinkPreview>(() => Promise.reject(new Error(" "))),
}));

describe(getLinkPreviewResponse, () => {
  // The library validates the resolved address of the link and of every redirect only when no resolver is passed, so a
  // Second argument here would switch the loopback, private and metadata blocks off
  test("the library is asked for the link alone, which keeps its private address block on", async () => {
    expect.hasAssertions();

    const href = "https://a.a/";
    await getLinkPreviewResponse(`<a href="${href}"></a>`);

    expect(getLinkPreview).toHaveBeenCalledWith(href);
  });
});
