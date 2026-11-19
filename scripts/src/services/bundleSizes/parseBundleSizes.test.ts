import { parseBundleSizes } from "#src/services/bundleSizes/parseBundleSizes";
import { describe, expect, test } from "vitest";

describe(parseBundleSizes, () => {
  test("reads each row of the record and skips its heading, separator and total", () => {
    expect.hasAssertions();

    const markdown = [
      "# Bundle sizes",
      "",
      "| Package | File | Bytes | KiB |",
      "| :------ | :--- | ----: | --: |",
      "| @esposter/shared | index.js | 1024 | 1.0 |",
      "| @esposter/infra | **/*.js |  2048 |  2.0 |",
      "",
      "**Total:** 2 files, 3072 bytes, 3.0 KiB, 0.00 MiB",
      "",
    ].join("\n");

    expect(parseBundleSizes(markdown)).toStrictEqual([
      { bytes: 1024, file: "index.js", packageName: "@esposter/shared" },
      { bytes: 2048, file: "**/*.js", packageName: "@esposter/infra" },
    ]);
  });
});
