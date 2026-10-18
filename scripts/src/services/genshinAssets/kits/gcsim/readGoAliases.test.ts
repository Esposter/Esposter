import { readGoAliases, resolveGoAlias } from "#src/services/genshinAssets/kits/gcsim/readGoAliases";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

// A made-up file binding `mult` twice, over `attack` and then over `skillAttack`, and a local that aliases `mult`
const source = `
func (c *char) attack() {
	for i, mult := range attack[c.NormalCounter] {
		use(mult[0])
	}
	for i, mult := range skillAttack[c.NormalCounter] {
		use(mult[0])
	}
	first := mult
}
`;

const tokens = tokenizeGo(source);
const usePosition = (occurrence: number) =>
  tokens.reduce(
    (found, token, position) => (token.text === "mult" && found.length < occurrence ? [...found, position] : found),
    [] as number[],
  )[occurrence - 1];

describe(readGoAliases, () => {
  test("resolves a name bound twice to the binding nearest before each use", () => {
    expect.hasAssertions();

    const aliasMap = readGoAliases(tokens);
    expect(aliasMap.get("mult")?.map(({ rootName }) => rootName)).toStrictEqual(["attack", "skillAttack"]);
    expect(resolveGoAlias(aliasMap, "mult", usePosition(2))).toBe("attack");
    expect(resolveGoAlias(aliasMap, "mult", usePosition(4))).toBe("skillAttack");
  });

  test("resolves a name with no position to its last binding, and an unbound name to itself", () => {
    expect.hasAssertions();

    const aliasMap = readGoAliases(tokens);
    expect(resolveGoAlias(aliasMap, "mult")).toBe("skillAttack");
    expect(resolveGoAlias(aliasMap, "attack")).toBe("attack");
    expect(resolveGoAlias(aliasMap, undefined)).toBeUndefined();
  });
});
