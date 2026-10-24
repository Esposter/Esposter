// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import PageBuilderPalette from "@/components/PageBuilder/Palette.vue";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("pageBuilderPalette", () => {
  test("a palette click still inserts the block", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, { content: [], root: TEST_ROOT });
    const announce = vi.fn<(message: string) => void>();
    const component = await mountSuspended(PageBuilderPalette, {
      props: {
        announce,
        getDocument: () => pageBuilderDocumentStore.getDocument(TEST_ID),
        kind: webpageKind,
        resourceId: TEST_ID,
      },
    });

    await component
      .findAll("button")
      .find((button) => button.text() === WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text])
      ?.trigger("click");

    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content.map(({ type }) => type)).toStrictEqual([
      WebpageNodeType.Text,
    ]);
  });
});
