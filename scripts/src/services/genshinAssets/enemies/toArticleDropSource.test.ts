import { toArticleDropSource } from "#src/services/genshinAssets/enemies/toArticleDropSource";
import { describe, expect, test } from "vitest";

describe(toArticleDropSource, () => {
  test("an article whose Drops Table names a family is a family's kind, by the first table it lists", () => {
    expect.hasAssertions();

    expect(
      toArticleDropSource(
        "Floating Anemo Fungus",
        "==Drops==\n{{Drops Table|type=Fungi (Small)}}\n{{Drops Table|type=Fungi (Small, Activated)|notice=0}}",
      ),
    ).toStrictEqual({ family: "Fungi (Small)", type: "family" });
  });

  test("an article whose Drops template names a template is a template's kind", () => {
    expect.hasAssertions();

    expect(toArticleDropSource("Eroding Avatar of Lava", "==Drops==\n{{Drops|Avatar of Lava}}")).toStrictEqual({
      template: "Avatar of Lava",
      type: "template",
    });
  });

  test("an article whose World Boss Rewards template gives a boss's reward is a boss's reward", () => {
    expect.hasAssertions();

    expect(
      toArticleDropSource(
        "Anemo Hypostasis",
        "==Drops==\n===Items===\n{{World Boss Rewards\n|gem = Vayuda Turquoise\n}}",
      ),
    ).toStrictEqual({ type: "bossReward" });
  });

  test("an article naming no drop source gives none, which the build refuses for a kind that is no boss", () => {
    expect.hasAssertions();

    expect(toArticleDropSource("Stormterror", "==Drops==\nNone.")).toStrictEqual({ type: "none" });
  });

  test("an article naming a family and a template is refused rather than read as either", () => {
    expect.hasAssertions();

    expect(() =>
      toArticleDropSource("Hilichurl Fighter", "{{Drops Table|type=Hilichurls}}\n{{Drops|Hilichurl Fighter}}"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Hilichurl Fighter, names more than one drop source]`,
    );
  });
});
