// @vitest-environment nuxt
import type { Editor } from "@tiptap/core";

import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { describe, expect, test, vi } from "vitest";

const createEditor = (text: string) => ({ getText: () => text }) as Editor;

describe(useSaveRichTextEdit, () => {
  const original = "<p>original</p>";
  const edit = "<p>edit</p>";
  const createSave = (editedValue: string, update = vi.fn<() => Promise<unknown>>(() => Promise.resolve())) => {
    const edited = ref(editedValue);
    // Spelled as one signature over the union of valid calls: `vi.fn` collapses an overloaded emit type to its
    // Last overload, which then rejects the other event
    const emit = vi.fn<(...parameters: ["update:delete-mode", true] | ["update:update-mode", false]) => void>();
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

    const { edited, emit, save } = createSave(
      edit,
      vi.fn<() => Promise<unknown>>(() => Promise.reject(new Error("error"))),
    );
    save(createEditor("edit"));
    await waitForSynchronizedFunctions();

    expect(emit).toHaveBeenCalledExactlyOnceWith("update:update-mode", false);
    expect(edited.value).toBe(original);
  });
});
