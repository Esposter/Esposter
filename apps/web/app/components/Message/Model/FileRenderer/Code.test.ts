// @vitest-environment nuxt
import type { Extension } from "@codemirror/state";

import { MimeType } from "#shared/models/file/MimeType";
import MessageModelFileRendererCode from "@/components/Message/Model/FileRenderer/Code.vue";
import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { language, StreamLanguage } from "@codemirror/language";
import { FileEntity } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { EditorView } from "codemirror";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { Transition } from "vue";

// The grammar loads from its own module on first use, so a test holds it back until the text is already on screen
vi.mock(import("@/services/codemirror/getLanguageExtension"), () => ({
  getLanguageExtension: vi.fn<typeof getLanguageExtension>(async () => []),
}));

describe("messageModelFileRendererCode", () => {
  const failedStatus = 500;
  const languageName = "Vue";
  const scrollTop = 40;
  const text = "attachment";
  const url = "";
  const file = new FileEntity({ filename: "filename", id: crypto.randomUUID(), mimetype: MimeType.PlainText, size: 1 });
  const props = { file, isPreview: false, language: languageName, url };
  const mountCode = (propsOverride?: Partial<typeof props>) =>
    mountSuspended(MessageModelFileRendererCode, { attachTo: document.body, props: { ...props, ...propsOverride } });
  const findView = () => {
    const editor = document.body.querySelector<HTMLElement>(".cm-editor");
    assert.exists(editor);
    const view = EditorView.findFromDOM(editor);
    assert.exists(view);
    return view;
  };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => new Response(text)),
    );
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("Opening a code attachment", async () => {
    expect.hasAssertions();

    await mountCode();
    const view = findView();

    expect(view.state.readOnly).toBe(true);
    expect(view.state.facet(EditorView.editable)).toBe(false);
    expect(view.state.doc.toString()).toBe(text);
  });

  test("Failed fetch of the file's text", async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => new Response(text, { status: failedStatus })),
    );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await mountCode();
    const view = findView();

    expect(view.state.doc.toString()).toBe("");
    expect(consoleError).toHaveBeenCalledOnce();
  });

  test("Previewed code attachment is capped", async () => {
    expect.hasAssertions();

    await mountCode({ isPreview: true });
    const view = findView();
    const probe = document.createElement("div");
    probe.style.maxHeight = PREVIEW_MAX_HEIGHT;
    document.body.append(probe);

    expect(getComputedStyle(view.dom).maxHeight).toBe(getComputedStyle(probe).maxHeight);
  });

  // A dialog's leave transition runs after the attachment's component has unmounted, so its text has to stay on screen
  // Until the transition removes the element, and the transition is held here so the text is read while it runs
  test("#78 A dialog closes around a code attachment", async () => {
    expect.hasAssertions();

    const isShown = ref(true);
    const { promise: leaveStarted, resolve: onLeaveStarted } = Promise.withResolvers<() => void>();
    const host = defineComponent({
      render: () =>
        h(Transition, { css: false, onLeave: (_element, done) => onLeaveStarted(done) }, () =>
          isShown.value ? h(MessageModelFileRendererCode, props) : null,
        ),
    });

    // Test utils stubs Transition by default, and the stub drops the leave hook this test holds
    await mountSuspended(host, { attachTo: document.body, global: { stubs: { transition: false } } });
    isShown.value = false;
    const finishLeave = await leaveStarted;

    expect(document.body.querySelector(".cm-content")?.textContent).toBe(text);

    finishLeave();

    expect(document.body.querySelector(".cm-editor")).toBeNull();
  });

  test("The attachment is removed", async () => {
    expect.hasAssertions();

    const destroy = vi.spyOn(EditorView.prototype, "destroy");
    const component = await mountCode();
    component.unmount();

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
  });

  test("The grammar arrives after the text", async () => {
    expect.hasAssertions();

    const grammarLoad = Promise.withResolvers<Extension[]>();
    const grammar = StreamLanguage.define({
      token: (stream) => {
        stream.skipToEnd();
        return null;
      },
    });
    vi.mocked(getLanguageExtension).mockImplementationOnce(() => grammarLoad.promise);
    await mountCode();
    const view = findView();

    expect(view.state.facet(language)).toBeNull();

    view.scrollDOM.scrollTop = scrollTop;
    const documentBefore = view.state.doc;
    const scrollTopBefore = view.scrollDOM.scrollTop;
    grammarLoad.resolve([grammar]);
    await flushPromises();

    expect(view.state.facet(language)).toBe(grammar);
    expect(view.state.doc).toBe(documentBefore);
    expect(view.scrollDOM.scrollTop).toBe(scrollTopBefore);
  });
});
