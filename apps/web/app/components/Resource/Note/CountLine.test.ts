// @vitest-environment nuxt
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import ResourceNoteCountLine from "#src/components/Resource/Note/CountLine.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/core";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe("resourceNoteCountLine", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({ content: "<p>a b c</p>", extensions: getNoteExtensions() });
  });
  afterEach(() => {
    editor.destroy();
  });

  // A collapsed caret counts the whole note, and a range counts only its own text, so the line follows the selection
  test("a selection shows its own counts", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceNoteCountLine, { props: { editor } });

    expect(component.text()).toBe("3 words · 5 characters");

    // Position 1 is where the first word starts and 2 where it ends, so this selects that word alone
    editor.commands.setTextSelection({ from: 1, to: 2 });
    await nextTick();

    expect(component.text()).toBe("1 word · 1 character");

    editor.commands.setTextSelection(2);
    await nextTick();

    expect(component.text()).toBe("3 words · 5 characters");
  });
});
