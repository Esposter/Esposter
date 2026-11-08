import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { rollUpBundleSizes } from "#src/services/bundleSizes/rollUpBundleSizes";
import { describe, expect, test } from "vitest";

describe(rollUpBundleSizes, () => {
  const packageName = "a";

  test("a file at the dist root keeps its own row", () => {
    expect.hasAssertions();

    const bundleSizes: BundleSize[] = [{ bytes: 1, file: "index.js", packageName }];

    expect(rollUpBundleSizes(bundleSizes)).toStrictEqual(bundleSizes);
  });

  test("the modules of one package and extension share one row", () => {
    expect.hasAssertions();

    expect(
      rollUpBundleSizes([
        { bytes: 1, file: "models/A.js", packageName },
        { bytes: 2, file: "services/B.js", packageName },
        { bytes: 4, file: "services/B.d.ts", packageName },
        { bytes: 8, file: "services/C.d.ts", packageName },
      ]),
    ).toStrictEqual([
      { bytes: 3, file: "**/*.js", packageName },
      { bytes: 12, file: "**/*.d.ts", packageName },
    ]);
  });

  test("the modules of two packages stay in two rows", () => {
    expect.hasAssertions();

    expect(
      rollUpBundleSizes([
        { bytes: 1, file: "models/A.js", packageName },
        { bytes: 2, file: "models/A.js", packageName: "b" },
      ]),
    ).toStrictEqual([
      { bytes: 1, file: "**/*.js", packageName },
      { bytes: 2, file: "**/*.js", packageName: "b" },
    ]);
  });
});
