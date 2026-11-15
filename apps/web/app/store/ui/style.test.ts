// @vitest-environment nuxt
import { DEFAULT_UI_STYLE } from "#configuration/constants";
import { UI_STYLE_COOKIE_NAME } from "#src/services/ui/constants";
import { useUiStyleStore } from "#src/store/ui/style";
import { describe, expect, test } from "vitest";

describe(useUiStyleStore, () => {
  test("reads a style no longer offered as the default", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line unicorn/no-document-cookie -- the store decodes the raw header, so a browser's own cookie is what the test writes
    window.document.cookie = `${UI_STYLE_COOKIE_NAME}=${UI_STYLE_COOKIE_NAME}`;
    const uiStyleStore = useUiStyleStore();
    const { uiStyle } = storeToRefs(uiStyleStore);

    expect(uiStyle.value).toBe(DEFAULT_UI_STYLE);
  });
});
