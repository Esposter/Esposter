import { parseDirectoryListing } from "#src/services/fleet/data/parseDirectoryListing";
import { describe, expect, test } from "vitest";

describe(parseDirectoryListing, () => {
  test("keeps a directory and a file named as an ISO datetime strings", () => {
    expect.hasAssertions();

    const listing = { directory: "2026-10-09T12:00:00Z", files: [{ mtime: 0, name: "2026-10-09T12:00:00Z", size: 1 }] };

    expect(parseDirectoryListing(JSON.stringify(listing))).toStrictEqual(listing);
  });
});
