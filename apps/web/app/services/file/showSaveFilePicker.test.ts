// @vitest-environment happy-dom
import { showSaveFilePicker } from "@/services/file/showSaveFilePicker";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(showSaveFilePicker, () => {
  const downloads: { download: string; href: string }[] = [];

  afterEach(() => {
    delete window.showSaveFilePicker;
    vi.restoreAllMocks();
    downloads.length = 0;
  });

  test("uses the browser's picker when it has one", async () => {
    expect.hasAssertions();

    const handle = {
      createWritable: () =>
        Promise.resolve({
          abort: () => Promise.resolve(),
          close: () => Promise.resolve(),
          write: () => Promise.resolve(),
        }),
    };
    const nativePicker = vi.fn<NonNullable<Window["showSaveFilePicker"]>>(() => Promise.resolve(handle));
    window.showSaveFilePicker = nativePicker;
    const options = { suggestedName: "a.png" };

    await expect(showSaveFilePicker(options)).resolves.toBe(handle);
    expect(nativePicker).toHaveBeenCalledWith(options);
  });

  test("downloads the written file under the suggested name when it closes", async () => {
    expect.hasAssertions();

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:a");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push({ download: this.download, href: this.href });
    });
    const handle = await showSaveFilePicker({ suggestedName: "a.png" });
    const writable = await handle.createWritable();

    await writable.write(new Blob(["a"], { type: "image/png" }));
    await writable.close();

    expect(downloads).toStrictEqual([{ download: "a.png", href: "blob:a" }]);
    expect(createObjectURL.mock.calls[0]?.[0]?.type).toBe("image/png");
  });

  test("downloads nothing until the writable closes", async () => {
    expect.hasAssertions();

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:a");
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const handle = await showSaveFilePicker({ suggestedName: "a.png" });
    const writable = await handle.createWritable();

    await writable.write(new Blob(["a"]));

    expect(click).not.toHaveBeenCalled();
  });
});
