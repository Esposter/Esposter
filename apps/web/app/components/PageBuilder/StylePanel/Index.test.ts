// @vitest-environment nuxt
import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";

import { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import {
  createTestImageNode,
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_THIRD_ID,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { getFieldInput } from "#src/components/PageBuilder/StylePanel/getFieldInput.test";
import { getSectorTitle } from "#src/components/PageBuilder/StylePanel/getSectorTitle.test";
import PageBuilderStylePanel from "#src/components/PageBuilder/StylePanel/Index.vue";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

// A section holding the style given at the base breakpoint in its default state
const createSection = (id: string, style: NodeStyle): SectionNode => ({
  props: { children: [], elementId: "", id, style, tag: HtmlTag.Section },
  type: WebpageNodeType.Section,
});

describe("pageBuilderStylePanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("drawing a node whose choices are unset records no edit", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        {
          props: { elementId: "", href: TEST_URL, id: TEST_ID, label: TEST_LABEL, target: ButtonTarget.SameTab },
          type: WebpageNodeType.Button,
        },
      ],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();

    const component = await mountSuspended(PageBuilderStylePanel, { props: { resourceId } });

    // A mandatory toggle group may pick its first choice on mount, which an edit would then record against the node
    expect(component.text()).toContain("column");
    expect(pageBuilderHistoryStore.getUndoLabel(resourceId)).toBe("");
  });

  test("a refused draft is not shown on the node selected after it", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createTestImageNode(TEST_URL, TEST_OTHER_ID), createTestImageNode(TEST_URL, TEST_THIRD_ID)],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderStylePanel, { props: { resourceId: TEST_ID } });
    const getWidthInput = () => {
      const forId = component
        .findAll("label")
        .find((label) => label.text() === "width")
        ?.attributes("for");
      return component.get(`input[id="${forId}"]`);
    };
    await getWidthInput().setValue("10px}");

    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_THIRD_ID);
    await component.vm.$nextTick();

    expect((getWidthInput().element as HTMLInputElement).value).toBe("");
  });

  test("a property the sectors lacked is set in its sector", async () => {
    expect.hasAssertions();

    vi.stubGlobal("CSS", { supports: () => true });
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [
        createSection(TEST_OTHER_ID, { [StyleBreakpoint.Base]: { [StyleState.Default]: { display: "flex" } } }),
      ],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderStylePanel, { props: { resourceId: TEST_ID } });
    await getFieldInput(component, "flex-wrap").setValue("wrap");

    expect(getSectorTitle(component, "flex-wrap")).toBe("Layout");
    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content[0]?.props.style).toStrictEqual({
      [StyleBreakpoint.Base]: { [StyleState.Default]: { display: "flex", "flex-wrap": "wrap" } },
    });
  });

  test("the Effects sector sets a transform", async () => {
    expect.hasAssertions();

    vi.stubGlobal("CSS", { supports: () => true });
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createButton(TEST_OTHER_ID)],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderStylePanel, { props: { resourceId: TEST_ID } });
    await getFieldInput(component, "transform").setValue("rotate(10deg)");

    expect(getSectorTitle(component, "transform")).toBe("Effects");
    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content[0]?.props.style).toStrictEqual({
      [StyleBreakpoint.Base]: { [StyleState.Default]: { transform: "rotate(10deg)" } },
    });
  });

  test("an unsupported value for a new property is not saved", async () => {
    expect.hasAssertions();

    vi.stubGlobal("CSS", { supports: () => false });
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [createSection(TEST_OTHER_ID, { [StyleBreakpoint.Base]: { [StyleState.Default]: { "z-index": "2" } } })],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderStylePanel, { props: { resourceId: TEST_ID } });
    await getFieldInput(component, "z-index").setValue("2px");
    await flushPromises();

    expect(component.text()).toContain("z-index does not take this value");
    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content[0]?.props.style).toStrictEqual({
      [StyleBreakpoint.Base]: { [StyleState.Default]: { "z-index": "2" } },
    });
  });
});
