// @vitest-environment nuxt
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { MAX_EMAIL_PREVIEW_LENGTH } from "#shared/services/pageBuilder/email/constants";
import PageBuilderEmailBar from "@/components/PageBuilder/Email/Bar.vue";
import type { EditorFinding } from "@/models/editor/EditorFinding";
import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { EmailView } from "@/models/pageBuilder/EmailView";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, onTestFinished, test } from "vitest";

describe("pageBuilderEmailBar", () => {
  const importLabel = "Import MJML";
  const overflowLabel = "More email actions";
  const message = "a";
  const getNodeTitle = (nodeId: string) => nodeId;
  const mountBar = async (findings: EditorFinding[] = []) => {
    const component = await mountSuspended(PageBuilderEmailBar, {
      attachTo: document.body,
      props: { error: "", findings, getNodeTitle, modelValue: EmailView.Design, resourceId: TEST_ID },
    });
    onTestFinished(() => {
      component.unmount();
    });
    return component;
  };

  test("Import MJML is in the overflow menu", async () => {
    expect.hasAssertions();

    const component = await mountBar();

    expect(component.text()).not.toContain(importLabel);

    await component.get(`[aria-label="${overflowLabel}"]`).trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const menuItemTitles = Array.from(document.querySelectorAll('[role="menuitem"]'), (item) => item.textContent);

    expect(menuItemTitles).toContain(importLabel);
  });

  test("a message that names a node selects it", async () => {
    expect.hasAssertions();

    const nodeId = crypto.randomUUID();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const component = await mountBar([{ message, nodeId, severity: EditorFindingSeverity.Error }]);
    await takeOne(component.get('[role="dialog"]').findAll("button"), 0).trigger("click");

    expect(pageBuilderCanvasStore.getSelectedNodeId(TEST_ID)).toBe(nodeId);
  });

  test("editing the preview text writes the root's preview", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, { content: [], root: { props: {} } });
    const component = await mountBar();
    await component.get("input").setValue(message);

    expect(pageBuilderDocumentStore.getEmailDocument(TEST_ID)?.root.props.preview).toBe(message);
  });

  test("the preview text shows the length its schema allows beside the field", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, { content: [], root: { props: {} } });
    const component = await mountBar();

    expect(component.text()).toContain(`0 / ${MAX_EMAIL_PREVIEW_LENGTH}`);
  });
});
