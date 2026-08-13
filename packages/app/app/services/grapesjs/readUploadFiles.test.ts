// @vitest-environment nuxt
import { readUploadFiles } from "@/services/grapesjs/readUploadFiles";
import { describe, expect, test } from "vitest";

const createFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  return dataTransfer.files;
};

describe(readUploadFiles, () => {
  const filename = "a";
  const createFile = () => new File([""], filename);

  test("reads files from the drag payload", () => {
    expect.hasAssertions();

    const file = createFile();
    const files = readUploadFiles({ dataTransfer: { files: createFileList([file]) } } as unknown as DragEvent);

    expect(files).toStrictEqual([file]);
  });

  test("reads files from the input element", () => {
    expect.hasAssertions();

    const file = createFile();
    const target = document.createElement("input");
    target.type = "file";
    target.files = createFileList([file]);
    const files = readUploadFiles({ target } as unknown as DragEvent);

    expect(files).toStrictEqual([file]);
  });

  test("reads no files without a drag payload or input element", () => {
    expect.hasAssertions();

    const files = readUploadFiles({ target: document.createElement("div") } as unknown as DragEvent);

    expect(files).toStrictEqual([]);
  });
});
