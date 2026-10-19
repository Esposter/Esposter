// @vitest-environment nuxt
import PageBuilderCanvasNodeToolbar from "@/components/PageBuilder/Canvas/NodeToolbar.vue";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("pageBuilderCanvasNodeToolbar", () => {
  test("the toolbar offers the node's moves", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, {
      content: [
        {
          props: { alt: "", decorative: true, id: TEST_OTHER_ID, src: "https://example.com/a.png" },
          type: WebpageNodeType.Image,
        },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderCanvasNodeToolbar, {
      props: { announce: vi.fn<(message: string) => void>(), position: { left: 0, top: 0 }, resourceId: TEST_ID },
    });

    expect(component.findAll("button").map((button) => button.attributes("aria-label"))).toStrictEqual([
      "Select parent",
      "Move up",
      "Move down",
      "Move to…",
      "Duplicate",
      "Delete",
    ]);

    await component.get("button[aria-label='Duplicate']").trigger("click");
    const copyId = pageBuilderCanvasStore.getSelectedNodeId(TEST_ID);

    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content).toStrictEqual([
      {
        props: { alt: "", decorative: true, id: TEST_OTHER_ID, src: "https://example.com/a.png" },
        type: WebpageNodeType.Image,
      },
      {
        props: { alt: "", decorative: true, id: copyId, src: "https://example.com/a.png" },
        type: WebpageNodeType.Image,
      },
    ]);
  });
});
