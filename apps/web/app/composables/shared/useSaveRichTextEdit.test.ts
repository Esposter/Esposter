import type { Editor } from "@tiptap/core";

import { describe, expect, test, vi } from "vitest";

const createEditor = (text: string) => ({ getText: () => text }) as Editor;

describe(useSaveRichTextEdit, () => {
  const original = "";
  const edit = " ";
  const text = "a";
  const answered = "answered";
  // Spelled as one signature over the union of valid calls: `vi.fn` collapses an overloaded emit type to its
  // Last overload, which then rejects the other event
  const createSave = (editedValue: string, isKept = true) => {
    const edited = ref(editedValue);
    // The stored text is what the write's answer leaves, so a kept write changes what the editor reopens on
    let stored = original;
    const update = vi.fn(() => {
      if (isKept) stored = answered;
      return Promise.resolve(isKept);
    });
    const emit = vi.fn<(...parameters: ["update:delete-mode", true] | ["update:update-mode", false]) => void>();
    const { isSaving, save } = useSaveRichTextEdit(edited, () => stored, update, emit);
    return { edited, emit, isSaving, save, update };
  };

  // The editor stays open until the answer lands, so the screen never shows the stored text it is about to replace
  test("stays open in a saving state until the answer arrives", async () => {
    expect.hasAssertions();

    const answer = Promise.withResolvers<boolean>();
    const update = vi.fn(() => answer.promise);
    const edited = ref(edit);
    const emit = vi.fn<(...parameters: ["update:delete-mode", true] | ["update:update-mode", false]) => void>();
    const { isSaving, save } = useSaveRichTextEdit(edited, () => original, update, emit);

    const saving = save(createEditor(text));

    expect(isSaving.value).toBe(true);
    expect(emit).not.toHaveBeenCalled();
    answer.resolve(true);
    await saving;
    expect(isSaving.value).toBe(false);
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
  });

  // A kept write closes the editor, and the editor reopens on the text the answer stored rather than on the draft
  test("closes on a kept write, showing the answered text", async () => {
    expect.hasAssertions();

    const { edited, emit, save, update } = createSave(edit);
    await save(createEditor(text));

    expect(update).toHaveBeenCalledExactlyOnceWith();
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
    expect(edited.value).toBe(answered);
  });

  // A refused write changes nothing, so the editor stays open with the draft the user typed still in it
  test("stays open with the draft intact when the write is refused", async () => {
    expect.hasAssertions();

    const { edited, emit, isSaving, save, update } = createSave(edit, false);
    await save(createEditor(text));

    expect(update).toHaveBeenCalledExactlyOnceWith();
    expect(emit).not.toHaveBeenCalledWith("update:update-mode", false);
    expect(edited.value).toBe(edit);
    expect(isSaving.value).toBe(false);
  });

  // Enter and the Save button both save, so a second press while the first write is out sends nothing
  test("sends no second write while one is in flight", async () => {
    expect.hasAssertions();

    const answer = Promise.withResolvers<boolean>();
    const update = vi.fn(() => answer.promise);
    const emit = vi.fn<(...parameters: ["update:delete-mode", true] | ["update:update-mode", false]) => void>();
    const { save } = useSaveRichTextEdit(ref(edit), () => original, update, emit);

    const saving = save(createEditor(text));
    await save(createEditor(text));
    answer.resolve(true);
    await saving;

    expect(update).toHaveBeenCalledOnce();
  });

  test("hands an emptied editor to delete mode instead of updating", async () => {
    expect.hasAssertions();

    const { emit, save, update } = createSave(edit);
    await save(createEditor(""));

    expect(update).not.toHaveBeenCalled();
    expect(emit.mock.calls).toStrictEqual([
      ["update:delete-mode", true],
      ["update:update-mode", false],
    ]);
  });

  // Opening the editor and closing it unchanged is the common case, and it must not cost a write
  test("writes nothing when the content is unchanged", async () => {
    expect.hasAssertions();

    const { emit, save, update } = createSave(original);
    await save(createEditor(text));

    expect(update).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
  });
});
