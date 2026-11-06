import { settleBundleSizes } from "#src/services/bundleSizes/settleBundleSizes";
import { describe, expect, test } from "vitest";

describe(settleBundleSizes, () => {
  const record =
    "| Package | File | Bytes | KiB |\n| genshin-interface | index.js | 1000 | 1.0 |\n| shared | index.js | 500 | 0.5 |\n";

  test("a checkout-dependent file within the tolerance keeps its recorded size", () => {
    expect.hasAssertions();

    expect(
      settleBundleSizes([{ bytes: 1004, file: "index.js", packageName: "genshin-interface" }], record),
    ).toStrictEqual([{ bytes: 1000, file: "index.js", packageName: "genshin-interface" }]);
  });

  test("a checkout-dependent file past the tolerance is its built size", () => {
    expect.hasAssertions();

    expect(
      settleBundleSizes([{ bytes: 1200, file: "index.js", packageName: "genshin-interface" }], record),
    ).toStrictEqual([{ bytes: 1200, file: "index.js", packageName: "genshin-interface" }]);
  });

  test("any other file is its built size, however close", () => {
    expect.hasAssertions();

    expect(settleBundleSizes([{ bytes: 501, file: "index.js", packageName: "shared" }], record)).toStrictEqual([
      { bytes: 501, file: "index.js", packageName: "shared" },
    ]);
  });
});
