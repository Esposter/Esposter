// @vitest-environment nuxt
import { TEST_ID, TEST_LANG } from "#shared/services/pageBuilder/constants.test";
import PageBuilderThemePanel from "@/components/PageBuilder/ThemePanel/Index.vue";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("pageBuilderThemePanel", () => {
  test("an emptied font stack keeps the one it held", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [],
      root: { props: { lang: TEST_LANG, tokens: { "font-body": "serif" } } },
    });
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();

    const component = await mountSuspended(PageBuilderThemePanel, { props: { resourceId: TEST_ID } });
    const forId = component
      .findAll("label")
      .find((label) => label.text() === "font-body")
      ?.attributes("for");
    await component.get(`input[id="${forId}"]`).setValue("");

    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.root.props.tokens).toStrictEqual({ "font-body": "serif" });
    expect(pageBuilderHistoryStore.historyMap.get(TEST_ID)).toBeUndefined();
  });
});
