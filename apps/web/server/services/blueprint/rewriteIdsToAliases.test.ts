import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { rewriteIdsToAliases } from "@@/server/services/blueprint/rewriteIdsToAliases";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(rewriteIdsToAliases, () => {
  const selectedId = crypto.randomUUID();
  const alias = buildBlueprintEntryToken("audience");
  const idAliasMap = new Map([[selectedId, alias]]);

  test("rewrites a whole-string id match to its alias, nested", () => {
    expect.hasAssertions();

    const result = rewriteIdsToAliases(
      { content: { emailId: selectedId, nested: [{ ref: selectedId }] }, type: ResourceType.Program },
      idAliasMap,
    );

    expect(result).toStrictEqual({ emailId: alias, nested: [{ ref: alias }] });
  });

  test("leaves unselected ids and id fragments untouched", () => {
    expect.hasAssertions();

    const otherId = crypto.randomUUID();
    const result = rewriteIdsToAliases(
      { content: { prose: `see ${selectedId} inline`, ref: otherId }, type: ResourceType.Program },
      idAliasMap,
    );

    expect(result).toStrictEqual({ prose: `see ${selectedId} inline`, ref: otherId });
  });

  test("leaves a captured blueprint's own manifest untouched", () => {
    expect.hasAssertions();

    const manifest = { entries: [{ content: { ref: selectedId }, key: "a", name: "a", type: ResourceType.Program }] };
    const result = rewriteIdsToAliases({ content: manifest, type: ResourceType.Blueprint }, idAliasMap);

    expect(result).toStrictEqual(manifest);
  });
});
