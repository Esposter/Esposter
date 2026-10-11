// @vitest-environment happy-dom
import { showOpenFilePicker } from "@/services/file/showOpenFilePicker";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

const getFileInput = () => takeOne([...document.querySelectorAll<HTMLInputElement>('input[type="file"]')]);

const file = new File([], "a.png", { type: "image/png" });

describe(showOpenFilePicker, () => {
  afterEach(() => {
    delete window.showOpenFilePicker;
  });

  test("uses the browser's picker when it has one", async () => {
    expect.hasAssertions();

    const handle = { getFile: () => Promise.resolve(file) };
    const nativePicker = vi.fn<NonNullable<Window["showOpenFilePicker"]>>(() => Promise.resolve([handle]));
    window.showOpenFilePicker = nativePicker;
    const options = { multiple: true, types: [{ accept: { "image/png": [".png"] } }] };

    await expect(showOpenFilePicker(options)).resolves.toStrictEqual([handle]);
    expect(nativePicker).toHaveBeenCalledWith(options);
  });

  test("falls back to a file input when the browser has no picker", async () => {
    expect.hasAssertions();

    const picked = showOpenFilePicker({ multiple: true });
    const input = getFileInput();
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change"));

    const [handle] = await picked;
    expect(input.multiple).toBe(true);
    await expect(handle?.getFile()).resolves.toBe(file);
  });
});
