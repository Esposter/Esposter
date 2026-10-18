// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import PageBuilderLayers from "@/components/PageBuilder/Layers.vue";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

const getFocusedId = () => document.activeElement?.getAttribute("data-item-id");
const press = async (key: string) => {
  assert.exists(document.activeElement);
  document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
  await flushPromises();
  return getFocusedId();
};

const textContent = { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" };
const sectionId = "section";
const nestedTextId = "nestedText";
const rootTextId = "rootText";
const webpage: WebpageDocument = {
  content: [
    {
      props: {
        children: [{ props: { content: textContent, id: nestedTextId }, type: WebpageNodeType.Text }],
        id: sectionId,
        tag: "section",
      },
      type: WebpageNodeType.Section,
    },
    { props: { content: textContent, id: rootTextId }, type: WebpageNodeType.Text },
  ],
  root: { props: { lang: "en" } },
};

describe("pageBuilderLayers", () => {
  test("arrow keys walk the layers tree and select the focused node", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    usePageBuilderDocumentStore().setDocument(resourceId, webpage);
    const component = await mountSuspended(PageBuilderLayers, { attachTo: document.body, props: { resourceId } });
    component.get(`[data-item-id="${sectionId}"]`).element.focus();

    await expect(press("ArrowDown")).resolves.toBe(nestedTextId);
    expect(usePageBuilderCanvasStore().getSelectedNodeId(resourceId)).toBe(nestedTextId);

    component.unmount();
  });

  test("typing a label in the tree moves focus to that node", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    usePageBuilderDocumentStore().setDocument(resourceId, webpage);
    const component = await mountSuspended(PageBuilderLayers, { attachTo: document.body, props: { resourceId } });
    component.get(`[data-item-id="${sectionId}"]`).element.focus();

    await press("t");

    await expect(press("e")).resolves.toBe(nestedTextId);

    component.unmount();
  });
});
