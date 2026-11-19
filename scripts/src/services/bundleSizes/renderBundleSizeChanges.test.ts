import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { BUNDLE_SIZE_READ_BYTES } from "#src/services/bundleSizes/constants";
import { renderBundleSizeChanges } from "#src/services/bundleSizes/renderBundleSizeChanges";
import { describe, expect, test } from "vitest";

describe(renderBundleSizeChanges, () => {
  const packageA = "@esposter/a";
  const packageB = "@esposter/b";
  const packageC = "@esposter/c";

  test("lists each moved row, the largest move first, and marks the growth a reader checks", () => {
    expect.hasAssertions();

    const previous: BundleSize[] = [
      { bytes: 1000, file: "index.js", packageName: packageA },
      { bytes: 5000, file: "**/*.js", packageName: packageA },
      { bytes: 300, file: "**/*.d.ts", packageName: packageB },
    ];
    const next: BundleSize[] = [
      { bytes: 1000, file: "index.js", packageName: packageA },
      { bytes: 6500, file: "**/*.js", packageName: packageA },
      { bytes: 250, file: "**/*.d.ts", packageName: packageB },
      { bytes: 40, file: "index.js", packageName: packageC },
    ];

    expect(renderBundleSizeChanges(previous, next)).toStrictEqual([
      `- ${packageA} **/*.js: 5000 -> 6500 bytes (+1500) (read)`,
      `- ${packageB} **/*.d.ts: 300 -> 250 bytes (-50)`,
      `- ${packageC} index.js: added at 40 bytes (read)`,
    ]);
  });

  test("a row that lost its file is listed as removed, and read", () => {
    expect.hasAssertions();

    expect(renderBundleSizeChanges([{ bytes: 40, file: "index.js", packageName: packageC }], [])).toStrictEqual([
      `- ${packageC} index.js: removed, was 40 bytes (read)`,
    ]);
  });

  test("a growth of a KiB is marked, one byte less is not", () => {
    expect.hasAssertions();

    const previous: BundleSize[] = [{ bytes: 0, file: "index.js", packageName: packageA }];

    expect(
      renderBundleSizeChanges(previous, [{ bytes: BUNDLE_SIZE_READ_BYTES, file: "index.js", packageName: packageA }]),
    ).toStrictEqual([
      `- ${packageA} index.js: 0 -> ${BUNDLE_SIZE_READ_BYTES} bytes (+${BUNDLE_SIZE_READ_BYTES}) (read)`,
    ]);
    expect(
      renderBundleSizeChanges(previous, [
        { bytes: BUNDLE_SIZE_READ_BYTES - 1, file: "index.js", packageName: packageA },
      ]),
    ).toStrictEqual([
      `- ${packageA} index.js: 0 -> ${BUNDLE_SIZE_READ_BYTES - 1} bytes (+${BUNDLE_SIZE_READ_BYTES - 1})`,
    ]);
  });

  test("a record with no row moved lists nothing", () => {
    expect.hasAssertions();

    const bundleSizes: BundleSize[] = [{ bytes: 1, file: "index.js", packageName: packageA }];

    expect(renderBundleSizeChanges(bundleSizes, bundleSizes)).toStrictEqual([]);
  });
});
