import { parseDirectoryListing } from "#src/services/fleet/data/parseDirectoryListing";
import { describe, expect, test } from "vitest";

describe(parseDirectoryListing, () => {
  test("keeps a directory and a file named as an ISO datetime strings", () => {
    expect.hasAssertions();

    const listing = {
      directory: new Date(0).toISOString(),
      files: [{ mtime: 0, name: new Date(0).toISOString(), size: 1 }],
    };

    expect(parseDirectoryListing(JSON.stringify(listing))).toStrictEqual(listing);
  });
});
