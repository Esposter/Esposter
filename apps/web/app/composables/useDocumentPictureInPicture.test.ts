// @vitest-environment happy-dom
import { useDocumentPictureInPicture } from "@/composables/useDocumentPictureInPicture";
import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { effectScope } from "vue";

describe(useDocumentPictureInPicture, () => {
  const attributeNames = ["data-theme", "data-ui-style"];

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const attributeName of attributeNames) window.document.documentElement.removeAttribute(attributeName);
  });

  test("carries the root's attributes, which the theme and the style hang off, into the window", async () => {
    expect.hasAssertions();

    for (const attributeName of attributeNames)
      window.document.documentElement.setAttribute(attributeName, attributeName);
    const target = {
      addEventListener: vi.fn<Window["addEventListener"]>(),
      close: vi.fn<Window["close"]>(),
      closed: false,
      document: window.document.implementation.createHTMLDocument(),
    };
    vi.stubGlobal("documentPictureInPicture", { requestWindow: () => Promise.resolve(target) });
    const scope = effectScope();
    const documentPictureInPicture = scope.run(() => useDocumentPictureInPicture());
    assert.exists(documentPictureInPicture);
    await documentPictureInPicture.open();

    expect(
      attributeNames.map((attributeName) => target.document.documentElement.getAttribute(attributeName)),
    ).toStrictEqual(attributeNames);

    scope.stop();
  });
});
