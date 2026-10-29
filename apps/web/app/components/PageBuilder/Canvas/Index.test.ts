// @vitest-environment nuxt
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import PageBuilderCanvas from "@/components/PageBuilder/Canvas/Index.vue";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test, vi } from "vitest";

describe("pageBuilderCanvas", () => {
  const TABLET_WIDTH = `${DEVICE_WIDTH_MAP[PageBuilderDevice.Tablet]}px`;

  test("switching to tablet draws the page at tablet width", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
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
      props: { announce: vi.fn<(message: string) => void>(), kind: webpageKind, resourceId: TEST_ID },
    });

    expect(component.get<HTMLIFrameElement>("iframe").element.style.width).toBe(TABLET_WIDTH);
  });

  test("switching to tablet draws the email at tablet width", async () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      `<mjml><mj-body><mj-section><mj-column><mj-text>a</mj-text></mj-column></mj-section></mj-body></mjml>`,
      emailRegistry,
      emailBodyChildrenSchema,
      noteRichText,
      MAX_EMAIL_NODES,
    );
    if (!result.success) throw new Error("the test email should parse");

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, result.data);
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setDevice(TEST_ID, PageBuilderDevice.Tablet);

    const component = await mountSuspended(PageBuilderCanvas, {
      props: { announce: vi.fn<(message: string) => void>(), kind: emailKind, resourceId: TEST_ID },
    });

    expect(component.get<HTMLIFrameElement>("iframe").element.style.width).toBe(TABLET_WIDTH);
  });

  test("a page with no document draws nothing", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderCanvas, {
      props: { announce: vi.fn<(message: string) => void>(), kind: webpageKind, resourceId: TEST_ID },
    });

    expect(component.find("iframe").exists()).toBe(false);
  });
});
