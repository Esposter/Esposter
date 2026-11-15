import { rewriteOldIds } from "#src/services/cutover/ids/rewriteOldIds";
import { describe, expect, test } from "vitest";

describe(rewriteOldIds, () => {
  const oldId = "0196a2e4-1f3b-4c7d-8e9f-0a1b2c3d4e5f";
  const newId = "0196a2e5-0000-7000-8000-000000000001";
  const unmappedOldId = "0196a2e4-aaaa-4bbb-8ccc-dddddddddddd";
  const oldIdNewIdMap = new Map([[oldId, newId]]);

  // An unmapped UUIDv4 belongs to no row, such as a file's or a poll option's, and every one is a UUIDv7 now
  test("rewrites a nested UUID inside a JSON column, and gives an unmapped UUIDv4 the version 7 digit", () => {
    expect.hasAssertions();

    const json = JSON.stringify({ files: [{ id: oldId, owner: unmappedOldId }] });

    expect(rewriteOldIds(json, oldIdNewIdMap)).toBe(
      JSON.stringify({ files: [{ id: newId, owner: "0196a2e4-aaaa-7bbb-8ccc-dddddddddddd" }] }),
    );
  });

  test("replaces only a whole token, never a UUID inside a longer one", () => {
    expect.hasAssertions();

    const longer = `${oldId}0`;

    expect(rewriteOldIds(`${longer} ${oldId}/content.json`, oldIdNewIdMap)).toBe(`${longer} ${newId}/content.json`);
  });
});
