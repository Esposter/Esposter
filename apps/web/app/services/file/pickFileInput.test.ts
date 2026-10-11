// @vitest-environment happy-dom
import { pickFileInput } from "@/services/file/pickFileInput";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const getFileInput = () => takeOne([...document.querySelectorAll<HTMLInputElement>('input[type="file"]')]);

const selectFiles = (input: HTMLInputElement, files: File[]) => {
  Object.defineProperty(input, "files", { value: files });
  input.dispatchEvent(new Event("change"));
};

describe(pickFileInput, () => {
  const types: FilePickerType[] = [
    { accept: { "image/png": [".png"] } },
    { accept: { "text/plain": [".txt", ".md"] } },
  ];

  test("accepts the mime type and the extensions of every type", () => {
    expect.hasAssertions();

    const picked = pickFileInput(types, false);
    const input = getFileInput();

    expect(input.accept).toBe("image/png,.png,text/plain,.txt,.md");
    input.dispatchEvent(new Event("cancel"));
    return expect(picked).rejects.toThrowErrorMatchingInlineSnapshot(`[AbortError: The user aborted a request.]`);
  });

  test("opens a single selection unless multiple is set", () => {
    expect.hasAssertions();

    const picked = pickFileInput(types, true);
    const input = getFileInput();

    expect(input.multiple).toBe(true);
    input.dispatchEvent(new Event("cancel"));
    return expect(picked).rejects.toThrowErrorMatchingInlineSnapshot(`[AbortError: The user aborted a request.]`);
  });

  test("resolves the files the user selected", async () => {
    expect.hasAssertions();

    const file = new File([], "a.png", { type: "image/png" });
    const picked = pickFileInput(types, false);
    selectFiles(getFileInput(), [file]);

    await expect(picked).resolves.toStrictEqual([file]);
  });

  test("rejects as AbortError when the dialog is cancelled", () => {
    expect.hasAssertions();

    const picked = pickFileInput(types, false);
    getFileInput().dispatchEvent(new Event("cancel"));

    return expect(picked).rejects.toThrowErrorMatchingInlineSnapshot(`[AbortError: The user aborted a request.]`);
  });

  test("rejects as AbortError when a change arrives with nothing selected", () => {
    expect.hasAssertions();

    const picked = pickFileInput(types, false);
    selectFiles(getFileInput(), []);

    return expect(picked).rejects.toThrowErrorMatchingInlineSnapshot(`[AbortError: The user aborted a request.]`);
  });

  test("removes its input once the selection settles", async () => {
    expect.hasAssertions();

    const picked = pickFileInput(types, false);
    selectFiles(getFileInput(), [new File([], "a.png", { type: "image/png" })]);
    await picked;

    expect(document.querySelectorAll('input[type="file"]')).toHaveLength(0);
  });
});
