// @vitest-environment nuxt
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_SURVEY_ID } from "#shared/services/pageBuilder/constants.test";
import {
  createTestSurveyInviteNode,
  createTestTextNode,
  TEST_GREY_RGB_VALUE,
} from "#shared/services/pageBuilder/critique/constants.test";
import PageBuilderCheck from "@/components/PageBuilder/Check/Index.vue";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("pageBuilderCheck", () => {
  const { trpcMsw } = setupMswTrpc();

  beforeEach(() => {
    trpcMsw.survey.readResources.query(() => ({ hasMore: false, items: [] }));
  });

  test("an unsaved edit changes the findings", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createTestTextNode(TEST_OTHER_ID, {})],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderCheck, { props: { resourceId: TEST_ID } });
    await flushPromises();
    const findingsBeforeEdit = component.findAll("button").map((button) => button.text());
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [
        createTestTextNode(TEST_OTHER_ID, {
          [StyleBreakpoint.Base]: { [StyleState.Default]: { color: TEST_GREY_RGB_VALUE } },
        }),
      ],
      root: TEST_ROOT,
    });
    await flushPromises();

    expect(findingsBeforeEdit).toStrictEqual([]);
    expect(component.findAll("button").map((button) => button.text())).toStrictEqual([
      "Text Contrast 1.61 to 1, under the 4.5 to 1 a text needs",
    ]);

    component.unmount();
  });

  test("an invite to an unpublished survey is reported", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createTestSurveyInviteNode(TEST_OTHER_ID, TEST_SURVEY_ID)],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderCheck, { props: { resourceId: TEST_ID } });
    await flushPromises();

    expect(component.findAll("button").map((button) => button.text())).toStrictEqual([
      "Survey invite Invite to a survey with no published version",
    ]);

    component.unmount();
  });

  test("two findings on one node are two rows, and choosing either selects the node", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [
        createTestTextNode(TEST_OTHER_ID, {
          [StyleBreakpoint.Base]: { [StyleState.Default]: { color: TEST_GREY_RGB_VALUE, width: "800px" } },
        }),
      ],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderCheck, { props: { resourceId: TEST_ID } });
    await flushPromises();
    const rows = component.findAll("button");

    expect(rows.map((row) => row.text())).toStrictEqual([
      "Text Fixed width of 800px is wider than a phone",
      "Text Contrast 1.61 to 1, under the 4.5 to 1 a text needs",
    ]);
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_ID);
    await takeOne(rows, 1).trigger("click");

    expect(pageBuilderCanvasStore.getSelectedNodeId(TEST_ID)).toStrictEqual(TEST_OTHER_ID);

    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_ID);
    await takeOne(rows).trigger("click");

    expect(pageBuilderCanvasStore.getSelectedNodeId(TEST_ID)).toStrictEqual(TEST_OTHER_ID);

    component.unmount();
  });

  test("a document with no survey invite reads no survey list", async () => {
    expect.hasAssertions();

    const readResources = vi.fn<() => { hasMore: false; items: [] }>(() => ({ hasMore: false, items: [] }));
    trpcMsw.survey.readResources.query(readResources);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createTestTextNode(TEST_OTHER_ID, {})],
      root: TEST_ROOT,
    });
    const component = await mountSuspended(PageBuilderCheck, { props: { resourceId: TEST_ID } });
    await flushPromises();

    expect(readResources).not.toHaveBeenCalled();

    component.unmount();
  });
});
