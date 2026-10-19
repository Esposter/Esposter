// @vitest-environment nuxt
import PageBuilderEditor from "@/components/PageBuilder/Editor.vue";
import {
  TEST_ROOT_TEXT_ID,
  TEST_TEXT_CONTENT,
  TEST_NESTED_TEXT_ID,
  TEST_SECTION_ID,
} from "@/services/pageBuilder/constants.test";
import { WEBPAGE_NODE_TYPE_TITLE_MAP, WEBPAGE_PALETTE_CATEGORY_MAP } from "@/services/pageBuilder/constants";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { nextTick } from "vue";

describe("pageBuilderEditor", () => {
  test("the editor draws the palette, the canvas and the content panel", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, {
      content: [
        {
          props: {
            children: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_NESTED_TEXT_ID }, type: WebpageNodeType.Text }],
            id: TEST_SECTION_ID,
            tag: "section",
          },
          type: WebpageNodeType.Section,
        },
      ],
      root: TEST_ROOT,
    });

    const component = await mountSuspended(PageBuilderEditor, { props: { resourceId } });

    expect(component.findAll("h3").map((heading) => heading.text())).toStrictEqual(
      Object.keys(WEBPAGE_PALETTE_CATEGORY_MAP),
    );
    expect(component.find("iframe").exists()).toBe(true);
    expect(component.get('[role="tab"]').text()).toBe("Content");
  });

  test("alt down moves the selected node after its next sibling", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { resourceId } });

    await component.trigger("keydown", { altKey: true, key: "ArrowDown" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_OTHER_ID,
      TEST_ROOT_TEXT_ID,
    ]);
  });

  test("delete removes the selected node", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { resourceId } });

    await component.trigger("keydown", { key: "Delete" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_OTHER_ID,
    ]);
  });

  test("a move announces its result in the live region", async () => {
    expect.hasAssertions();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const component = await mountSuspended(PageBuilderEditor, { props: { resourceId } });

    await component.trigger("keydown", { altKey: true, key: "ArrowDown" });
    await nextTick();

    expect(component.get('[role="status"]').text()).toBe(
      `Moved ${WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text]} 2 to position 2 of 2 in The page`,
    );
  });

  test("an empty page shows the palette instead of the canvas", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();

    const resourceId = crypto.randomUUID();
    pageBuilderDocumentStore.setDocument(resourceId, { content: [], root: TEST_ROOT });

    const component = await mountSuspended(PageBuilderEditor, { props: { resourceId } });

    expect(component.find("iframe").exists()).toBe(false);
    expect(component.text()).toContain("This page is empty");
  });
});
