import type { Editor } from "@tiptap/core";

import { describe, expect, test, vi } from "vitest";

const createEditor = (text: string) => ({ getText: () => text }) as Editor;

describe(useSaveRichTextEdit, () => {
  const original = "";
  const edit = " ";
  const text = "a";
  const createSave = (editedValue: string) => {
    const edited = ref(editedValue);
    const update = vi.fn<() => void>();
    // Spelled as one signature over the union of valid calls: `vi.fn` collapses an overloaded emit type to its
    // Last overload, which then rejects the other event
    const emit = vi.fn<(...parameters: ["update:delete-mode", true] | ["update:update-mode", false]) => void>();
    return { edited, emit, save: useSaveRichTextEdit(edited, () => original, update, emit), update };
  };

  test("updates and leaves edit mode", () => {
    expect.hasAssertions();

    const { edited, emit, save, update } = createSave(edit);
    save(createEditor(text));

    expect(update).toHaveBeenCalledExactlyOnceWith();
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
    expect(edited.value).toBe(original);
  });

  test("hands an emptied editor to delete mode instead of updating", () => {
    expect.hasAssertions();

    const { emit, save, update } = createSave(edit);
    save(createEditor(""));

    expect(update).not.toHaveBeenCalled();
    expect(emit.mock.calls).toStrictEqual([
      ["update:delete-mode", true],
      ["update:update-mode", false],
    ]);
  });

  // Opening the editor and closing it unchanged is the common case, and it must not cost a write
  test("writes nothing when the content is unchanged", () => {
    expect.hasAssertions();

    const { emit, save, update } = createSave(original);
    save(createEditor(text));

    expect(update).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
  });
});
