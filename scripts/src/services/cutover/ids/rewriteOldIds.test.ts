import { describe, expect, test } from "vitest";

import { rewriteOldIds } from "#src/services/cutover/ids/rewriteOldIds";

describe(rewriteOldIds, () => {
  const oldId = "0196a2e4-1f3b-4c7d-8e9f-0a1b2c3d4e5f";
  const newId = "0196a2e5-0000-7000-8000-000000000001";
  const unmappedOldId = "0196a2e4-aaaa-4bbb-8ccc-dddddddddddd";
  const newIdByOldId = new Map([[oldId, newId]]);

  test("rewrites a nested UUID inside a JSON column, and leaves an unmapped one as it is", () => {
    expect.hasAssertions();

    const json = JSON.stringify({ files: [{ id: oldId, owner: unmappedOldId }] });

    expect(rewriteOldIds(json, newIdByOldId)).toBe(JSON.stringify({ files: [{ id: newId, owner: unmappedOldId }] }));
  });

  test("replaces only a whole token, never a UUID inside a longer one", () => {
    expect.hasAssertions();

    const longer = `${oldId}0`;

    expect(rewriteOldIds(`${longer} ${oldId}/content.json`, newIdByOldId)).toBe(`${longer} ${newId}/content.json`);
  });
});
