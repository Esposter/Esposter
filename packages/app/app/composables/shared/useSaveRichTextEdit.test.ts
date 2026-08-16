// @vitest-environment nuxt
import type { SaveRichTextEditEmit } from "@/composables/shared/useSaveRichTextEdit";
import type { Editor } from "@tiptap/core";

import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { describe, expect, test, vi } from "vitest";

describe(useSaveRichTextEdit, () => {
  const original = "<p>original</p>";
  const edit = "<p>edit</p>";
  const createEditor = (text: string) => ({ getText: () => text }) as Editor;
  const createSave = (editedValue: string) => {
    const edited = ref(editedValue);
    const update = vi.fn(() => Promise.resolve());
    const emit = vi.fn() as ReturnType<typeof vi.fn> & SaveRichTextEditEmit;
    return { edited, emit, save: useSaveRichTextEdit(edited, () => original, update, emit), update };
  };

  test("updates and leaves edit mode", async () => {
    expect.hasAssertions();

    const { edited, emit, save, update } = createSave(edit);
    save(createEditor("edit"));
    await waitForSynchronizedFunctions();

    expect(update).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
    expect(edited.value).toBe(original);
  });

  // Editing away the last character is the delete gesture, so an emptied editor must not save an empty body
  test("hands an emptied editor to delete mode instead of updating", async () => {
    expect.hasAssertions();

    const { emit, save, update } = createSave("<p></p>");
    save(createEditor(""));
    await waitForSynchronizedFunctions();

    expect(update).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith("update:delete-mode", true);
  });

  // Opening the editor and closing it unchanged is the common case, and it must not cost a write
  test("writes nothing when the content is unchanged", async () => {
    expect.hasAssertions();

    const { emit, save, update } = createSave(original);
    save(createEditor("original"));
    await waitForSynchronizedFunctions();

    expect(update).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
  });

  // The finalizer runs on every path, so a rejected write still closes the editor and reverts to the server's copy
  test("leaves edit mode and reverts when the update fails", async () => {
    expect.hasAssertions();

    const edited = ref(edit);
    const emit = vi.fn() as ReturnType<typeof vi.fn> & SaveRichTextEditEmit;
    const save = useSaveRichTextEdit(
      edited,
      () => original,
      () => Promise.reject(new Error("error")),
      emit,
    );
    save(createEditor("edit"));
    await waitForSynchronizedFunctions();

    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
    expect(edited.value).toBe(original);
  });
});
