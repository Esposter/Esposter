// @vitest-environment happy-dom
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { Editor } from "@tiptap/core";
import { describe, expect, test } from "vitest";

// A paste reaches the editor's clipboard parser as HTML, so the image's rule is the one a pasted web image meets
const getPastedImageSources = (html: string) => {
  const editor = new Editor({ element: document.createElement("div"), extensions: getNoteExtensions() });
  editor.view.pasteHTML(html);
  return (editor.getJSON().content ?? []).filter(({ type }) => type === "image").map(({ attrs }) => attrs?.src);
};

describe(getNoteExtensions, () => {
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const assetUrl = getResourceAssetUrl(getResourceFileBlobName(resourceId, hash));

  // A web page's image copied with its own address is refused, since the published view would drop it
  test("an image pasted from another site is not kept", () => {
    expect.hasAssertions();

    expect(getPastedImageSources(`<img src="https://a">`)).toStrictEqual([]);
  });

  test("an image pasted from resource storage is kept", () => {
    expect.hasAssertions();

    expect(getPastedImageSources(`<img src="${assetUrl}">`)).toStrictEqual([assetUrl]);
  });
});
