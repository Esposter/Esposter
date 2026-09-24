// @vitest-environment nuxt
import { UI_STYLE_COOKIE_NAME } from "@/services/ui/constants";
import { useUiStyleStore } from "@/store/ui/style";
import { DEFAULT_UI_STYLE } from "@@/configuration/UiStyleMap";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useUiStyleStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("reads a style no longer offered as the default", () => {
    expect.hasAssertions();

    document.cookie = `${UI_STYLE_COOKIE_NAME}=${UI_STYLE_COOKIE_NAME}`;
    const uiStyleStore = useUiStyleStore();
    const { uiStyle } = storeToRefs(uiStyleStore);

    expect(uiStyle.value).toBe(DEFAULT_UI_STYLE);
  });
});
