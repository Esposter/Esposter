import type { JSONContent } from "@tiptap/core";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { describe, expect, test } from "vitest";

describe(renderNoteHtml, () => {
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const alt = "a";
  const assetUrl = getResourceAssetUrl(getResourceFileBlobName(resourceId, hash));
  const createImageDocument = (src: string): JSONContent => ({
    content: [{ attrs: { alt, src }, type: "image" }],
    type: "doc",
  });

  test("A published note shows its own image", () => {
    expect.hasAssertions();

    expect(renderNoteHtml(createImageDocument(assetUrl))).toBe(`<img src="${assetUrl}" alt="${alt}">`);
  });

  test("A published note drops an image from another site", () => {
    expect.hasAssertions();

    expect(renderNoteHtml(createImageDocument("https://a"))).toBe("");
  });
});
