import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { R2Object } from "#src/models/cutover/R2Object";

import { checkIsSameObject } from "#src/services/cutover/objects/checkIsSameObject";
import { describe, expect, test } from "vitest";

describe(checkIsSameObject, () => {
  const blob: BlobEntry = { lastModified: new Date(0), md5: "AQID", name: "a", size: 3 };
  const stored: R2Object = { etag: "010203", key: "a", size: 3 };

  test("is true for an object with the blob's size and MD5", () => {
    expect.hasAssertions();

    expect(checkIsSameObject(blob, stored)).toStrictEqual(true);
  });

  test("is false when no object is stored", () => {
    expect.hasAssertions();

    expect(checkIsSameObject(blob, undefined)).toStrictEqual(false);
  });

  test("is false for a blob Azure stored no MD5 for", () => {
    expect.hasAssertions();

    expect(checkIsSameObject({ ...blob, md5: undefined }, stored)).toStrictEqual(false);
  });

  test("is false when the sizes differ", () => {
    expect.hasAssertions();

    expect(checkIsSameObject(blob, { ...stored, size: 4 })).toStrictEqual(false);
  });

  test("is false when the MD5 differs", () => {
    expect.hasAssertions();

    expect(checkIsSameObject(blob, { ...stored, etag: "010204" })).toStrictEqual(false);
  });
});
