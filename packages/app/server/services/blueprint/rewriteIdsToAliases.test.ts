import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { rewriteIdsToAliases } from "@@/server/services/blueprint/rewriteIdsToAliases";
import { describe, expect, test } from "vitest";

describe(rewriteIdsToAliases, () => {
  const selectedId = crypto.randomUUID();
  const alias = buildBlueprintEntryToken("audience");
  const idToAlias = new Map([[selectedId, alias]]);

  test("rewrites a whole-string id match to its alias, nested", () => {
    expect.hasAssertions();

    const result = rewriteIdsToAliases({ emailId: selectedId, nested: [{ ref: selectedId }] }, idToAlias);

    expect(result).toStrictEqual({ emailId: alias, nested: [{ ref: alias }] });
  });

  test("leaves unselected ids and id fragments untouched", () => {
    expect.hasAssertions();

    const otherId = crypto.randomUUID();
    const result = rewriteIdsToAliases({ prose: `see ${selectedId} inline`, ref: otherId }, idToAlias);

    expect(result).toStrictEqual({ prose: `see ${selectedId} inline`, ref: otherId });
  });
});
