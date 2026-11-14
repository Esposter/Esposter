import { rewriteIdsToAliases } from "#server/services/blueprint/rewriteIdsToAliases";
import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { ResourceType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(rewriteIdsToAliases, () => {
  const selectedId = v7();
  const alias = buildBlueprintEntryToken("a");
  const idAliasMap = new Map([[selectedId, alias]]);

  test("rewrites a whole-string id match to its alias, nested", () => {
    expect.hasAssertions();

    const result = rewriteIdsToAliases(
      { content: { "": selectedId, " ": [{ "": selectedId }] }, type: ResourceType.Program },
      idAliasMap,
    );

    expect(result).toStrictEqual({ "": alias, " ": [{ "": alias }] });
  });

  test("leaves unselected ids and id fragments untouched", () => {
    expect.hasAssertions();

    const otherId = v7();
    const result = rewriteIdsToAliases(
      { content: { "": `${selectedId} `, " ": otherId }, type: ResourceType.Program },
      idAliasMap,
    );

    expect(result).toStrictEqual({ "": `${selectedId} `, " ": otherId });
  });

  test("leaves a captured blueprint's own manifest untouched", () => {
    expect.hasAssertions();

    const manifest = { entries: [{ content: { "": selectedId }, key: "a", name: "a", type: ResourceType.Program }] };
    const result = rewriteIdsToAliases({ content: manifest, type: ResourceType.Blueprint }, idAliasMap);

    expect(result).toStrictEqual(manifest);
  });
});
