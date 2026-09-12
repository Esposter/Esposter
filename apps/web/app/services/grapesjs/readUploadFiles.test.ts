// @vitest-environment happy-dom
import { readUploadFiles } from "@/services/grapesjs/readUploadFiles";
import { describe, expect, test } from "vitest";

const createDataTransfer = (files: File[]) => {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  return dataTransfer;
};

describe(readUploadFiles, () => {
  const filename = "a";
  const createFile = () => new File([""], filename);

  test("reads files from the drag payload", () => {
    expect.hasAssertions();

    const file = createFile();
    const files = readUploadFiles({ dataTransfer: createDataTransfer([file]), target: null });

    expect(files).toStrictEqual([file]);
  });

  test("reads files from the input element", () => {
    expect.hasAssertions();

    const file = createFile();
    const target = document.createElement("input");
    target.type = "file";
    target.files = createDataTransfer([file]).files;
    const files = readUploadFiles({ dataTransfer: null, target });

    expect(files).toStrictEqual([file]);
  });

  test("reads no files without a drag payload or input element", () => {
    expect.hasAssertions();

    const files = readUploadFiles({ dataTransfer: null, target: document.createElement("div") });

    expect(files).toStrictEqual([]);
  });
});
