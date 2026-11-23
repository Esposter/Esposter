import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderTheme } from "#src/composables/pageBuilder/usePageBuilderTheme";
import { DEFAULT_FONT_STACK } from "#src/services/pageBuilder/constants";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePageBuilderTheme, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // A blank stack is never saved, since a custom property with no value makes every use of it fall back to the initial
  // Value
  test("a blank font stack saves nothing", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, { content: [], root: TEST_ROOT });
    const { addFontStack, fonts, setFontStack } = usePageBuilderTheme(resourceId);
    addFontStack();
    const { name } = takeOne(fonts.value);

    setFontStack(name, " ");

    expect(takeOne(fonts.value).value).toBe(DEFAULT_FONT_STACK);
  });
});
