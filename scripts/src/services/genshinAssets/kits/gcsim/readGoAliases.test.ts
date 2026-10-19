import { readGoAliases, resolveGoAlias } from "#src/services/genshinAssets/kits/gcsim/readGoAliases";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

describe(readGoAliases, () => {
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
    tokens.reduce<number[]>(
      (found, token, position) => (token.text === "mult" && found.length < occurrence ? [...found, position] : found),
      [],
    )[occurrence - 1];

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

  test("resolves a loop's value variable over a bare name to that name, its brace opening the loop's body", () => {
    expect.hasAssertions();

    const bareSource = `
func (c *char) burst() {
	for i, mult := range burstWhiteInitial {
		ai.Mult = mult[c.TalentLvlBurst()]
	}
}
`;
    const bareTokens = tokenizeGo(bareSource);
    const aliasMap = readGoAliases(bareTokens);
    const multPosition = bareTokens.findIndex(({ text }) => text === "Mult") + 2;
    expect(resolveGoAlias(aliasMap, "mult", multPosition)).toBe("burstWhiteInitial");
  });
});
