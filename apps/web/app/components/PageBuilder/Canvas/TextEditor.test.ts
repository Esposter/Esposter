// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import PageBuilderCanvasTextEditor from "#src/components/PageBuilder/Canvas/TextEditor.vue";
import { TEST_ROOT_TEXT_ID, TEST_SECTION_ID, TEST_TEXT_CONTENT } from "#src/services/pageBuilder/constants.test";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { useRichTextSuggestionStore } from "#src/store/richTextEditor/suggestion";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { EditorContent } from "@tiptap/vue-3";
import { flushPromises } from "@vue/test-utils";
import { MjmlNodeType } from "mjml-blocks";
import { v7 } from "uuid";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const mountEditingText = async () => {
  const resourceId = v7();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
    content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
    root: TEST_ROOT,
  });
  const component = await mountSuspended(PageBuilderCanvasTextEditor, {
    props: { kind: webpageKind, nodeId: TEST_ROOT_TEXT_ID, resourceId },
  });
  await vi.advanceTimersByTimeAsync(0);
  const editor = component.getComponent(EditorContent).props("editor");
  assert.exists(editor);
  return { component, editor };
};

describe("pageBuilderCanvasTextEditor", () => {
  // An editor takes its focus, and its caret at the end of the text, on a timer it sets as it mounts; only `setTimeout`
  // Is faked, so the promises the suite flushes keep running
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("begins editing at the end of its text", async () => {
    expect.hasAssertions();

    const { component, editor } = await mountEditingText();

    expect(editor.state.selection.head).toBe(editor.state.doc.content.size - 1);
    component.unmount();
  });

  test("leaves a reader who is typing elsewhere alone", async () => {
    expect.hasAssertions();

    const typing = window.document.createElement("textarea");
    window.document.body.append(typing);
    typing.focus();
    const { component, editor } = await mountEditingText();

    expect(window.document.activeElement).toBe(typing);
    expect(editor.state.selection.head).toBe(1);
    typing.remove();
    component.unmount();
  });

  test("a text node being edited shows its own text in the editor", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });

    const component = await mountSuspended(PageBuilderCanvasTextEditor, {
      props: { kind: webpageKind, nodeId: TEST_ROOT_TEXT_ID, resourceId },
    });
    await nextTick();

    expect(component.get(".ProseMirror").text()).toBe(TEST_ID);
    component.unmount();
  });

  test("escape leaves a text node being edited", async () => {
    expect.hasAssertions();

    const resourceId = v7();
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
      props: { kind: webpageKind, nodeId: TEST_ROOT_TEXT_ID, resourceId },
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

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text }],
      root: TEST_ROOT,
    });
    const pastLengthBefore = pageBuilderHistoryStore.historyMap.get(resourceId)?.past.length ?? 0;
    const editSession = async (text: string) => {
      const component = await mountSuspended(PageBuilderCanvasTextEditor, {
        props: { kind: webpageKind, nodeId: TEST_ROOT_TEXT_ID, resourceId },
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

  test("typing two braces offers the dataset's columns", async () => {
    expect.hasAssertions();

    const columnId = v7();
    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: MjmlNodeType.Text }],
                  id: columnId,
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: TEST_SECTION_ID,
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: {} },
    });
    const { setMergeFieldColumns } = pageBuilderDocumentStore;
    setMergeFieldColumns(resourceId, ["first_name", "last_name"]);
    const component = await mountSuspended(PageBuilderCanvasTextEditor, {
      props: { kind: emailKind, nodeId: TEST_ROOT_TEXT_ID, resourceId },
    });
    await vi.advanceTimersByTimeAsync(0);
    const editor = component.getComponent(EditorContent).props("editor");
    assert.exists(editor);

    // The braces open after a space, as the suggestion only opens where a word begins
    editor.commands.insertContent(" {{");
    // The suggestion's items resolve after the keystroke, so the list is read once the promises it waits on have settled
    await flushPromises();
    const richTextSuggestionStore = useRichTextSuggestionStore();

    expect(richTextSuggestionStore.suggestion?.props.items).toStrictEqual(["first_name", "last_name"]);
    richTextSuggestionStore.suggestion?.props.command("last_name");

    expect(editor.getText()).toBe(`${TEST_ID} {{last_name}}`);
    component.unmount();
  });
});
