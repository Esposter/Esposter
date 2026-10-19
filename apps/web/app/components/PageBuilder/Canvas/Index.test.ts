// @vitest-environment nuxt
import PageBuilderCanvas from "@/components/PageBuilder/Canvas/Index.vue";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("pageBuilderCanvas", () => {
  test("switching to tablet draws the page at tablet width", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, {
      content: [
        {
          props: {
            content: { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" },
            id: TEST_OTHER_ID,
          },
          type: WebpageNodeType.Text,
        },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setDevice(TEST_ID, PageBuilderDevice.Tablet);

    const component = await mountSuspended(PageBuilderCanvas, {
      props: { announce: vi.fn<(message: string) => void>(), resourceId: TEST_ID },
    });

    expect((component.get("iframe").element as HTMLIFrameElement).style.width).toBe("768px");
  });

  test("a page with no document draws nothing", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderCanvas, {
      props: { announce: vi.fn<(message: string) => void>(), resourceId: TEST_ID },
    });

    expect(component.find("iframe").exists()).toBe(false);
  });
});
