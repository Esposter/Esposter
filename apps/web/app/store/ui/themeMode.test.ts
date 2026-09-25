// @vitest-environment nuxt
import { ThemeMode } from "@/models/ui/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/ui/constants";
import { useThemeModeStore } from "@/store/ui/themeMode";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useThemeModeStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("reads a mode no longer offered as the system's", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line unicorn/no-document-cookie -- the store decodes the raw header, so a browser's own cookie is what the test writes
    window.document.cookie = `${THEME_COOKIE_NAME}=${THEME_COOKIE_NAME}`;
    const themeModeStore = useThemeModeStore();
    const { themeMode } = storeToRefs(themeModeStore);

    expect(themeMode.value).toBe(ThemeMode.System);
  });

  test("resolves the system's mode from its scheme, and a chosen mode as itself", () => {
    expect.hasAssertions();

    const themeModeStore = useThemeModeStore();
    const { isSystemDark, resolvedThemeMode, themeMode } = storeToRefs(themeModeStore);
    themeMode.value = ThemeMode.System;

    expect(resolvedThemeMode.value).toBe(ThemeMode.Light);

    isSystemDark.value = true;

    expect(resolvedThemeMode.value).toBe(ThemeMode.Dark);

    themeMode.value = ThemeMode.Light;

    expect(resolvedThemeMode.value).toBe(ThemeMode.Light);
  });
});
