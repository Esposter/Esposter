// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import PageBuilderCanvasTextEditor from "@/components/PageBuilder/Canvas/TextEditor.vue";
import { TEST_ROOT_TEXT_ID, TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { EditorContent } from "@tiptap/vue-3";
import { assert, describe, expect, test } from "vitest";
import { nextTick } from "vue";
import { webpageKind } from "@/services/pageBuilder/webpageKind";

describe("pageBuilderCanvasTextEditor", () => {
  test("enter edits a text node in place", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });

    const component = await mountSuspended(PageBuilderCanvasTextEditor, {
      props: { nodeId: TEST_ROOT_TEXT_ID, resourceId },
    });
    await nextTick();

    expect(component.get(".ProseMirror").text()).toBe(TEST_ID);
    component.unmount();
  });

  test("escape leaves a text node being edited", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setEditingNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const pastLengthBefore = pageBuilderHistoryStore.historyMap.get(resourceId)?.past.length ?? 0;
    const component = await mountSuspended(PageBuilderCanvasTextEditor, {
      props: { nodeId: TEST_ROOT_TEXT_ID, resourceId },
    });
    await nextTick();
    const editor = component.getComponent(EditorContent).props("editor");
    assert.exists(editor);

    // Two updates in one session are one history entry
    editor.commands.insertContent("a");
    editor.commands.insertContent("b");
    await component.trigger("keydown", { key: "Escape" });

    expect(pageBuilderCanvasStore.getEditingNodeId(resourceId)).toBe("");
    expect(pageBuilderHistoryStore.historyMap.get(resourceId)?.past.length).toBe(pastLengthBefore + 1);
    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual([
      { props: { content: editor.getJSON(), id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
    ]);
    component.unmount();
  });

  test("each edit session is its own history entry", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    const pastLengthBefore = pageBuilderHistoryStore.historyMap.get(resourceId)?.past.length ?? 0;
    const editSession = async (text: string) => {
      const component = await mountSuspended(PageBuilderCanvasTextEditor, {
        props: { nodeId: TEST_ROOT_TEXT_ID, resourceId },
      });
      await nextTick();
      const editor = component.getComponent(EditorContent).props("editor");
      assert.exists(editor);

      editor.commands.insertContent(text);
      await component.trigger("keydown", { key: "Escape" });
      component.unmount();
    };

    await editSession("a");
    await editSession("b");

    expect(pageBuilderHistoryStore.historyMap.get(resourceId)?.past.length).toBe(pastLengthBefore + 2);
  });
});
