// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_CONTEXT, TEST_ID, TEST_LABEL, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import PageBuilderContentPanel from "@/components/PageBuilder/ContentPanel.vue";
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";

const createButtonDocument = (): WebpageDocument => ({
  content: [{ props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button }],
  root: TEST_ROOT,
});

describe("pageBuilderContentPanel", () => {
  test("editing a button's label in the content panel shows on the canvas", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { href: TEST_URL, label: "Open" });

    const document = webpageDocumentSchema.parse(pageBuilderDocumentStore.getDocument(resourceId));
    expect(document.content).toStrictEqual([
      { props: { href: TEST_URL, id: TEST_ID, label: "Open" }, type: WebpageNodeType.Button },
    ]);
    const canvas = mount(defineComponent({ render: () => h("div", renderCanvasVNodes(document, TEST_CONTEXT)) }));
    expect(canvas.text()).toBe("Open");

    canvas.unmount();
    component.unmount();
  });

  test("an invalid label is not applied", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { href: TEST_URL, label: "" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual(createButtonDocument().content);

    component.unmount();
  });

  test("with nothing selected the panel edits the root language", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, createButtonDocument());
    const component = await mountSuspended(PageBuilderContentPanel, { props: { resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { lang: "fr" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.root).toStrictEqual({ props: { lang: "fr", tokens: {} } });

    component.unmount();
  });
});
