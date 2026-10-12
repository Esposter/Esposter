import { describe, expect, test } from "vitest";

describe("kit modules", () => {
  // What only a kit's record holds: a frame count turned into seconds, a talent's proud skill group and a parameter
  // Read off its table. A module writing one back is holding a value the record should hold
  const RECORD_VALUE_PATTERNS = [
    /\/\s*(?:60\b|KIT_FRAMES_PER_SECOND\b)/u,
    /\bproudSkillGroupId\b/u,
    /\bgetTalentMultiplier\(/u,
  ];

  test("holds behaviour alone, every frame, area and talent index read from its record", () => {
    expect.hasAssertions();

    const kitModuleSourceMap = import.meta.glob<string>("/src/services/kit/characters/*Kit.ts", {
      eager: true,
      import: "default",
      query: "?raw",
    });

    expect(
      Object.entries(kitModuleSourceMap).flatMap(([path, source]) =>
        RECORD_VALUE_PATTERNS.filter((pattern) => pattern.test(source)).map((pattern) => `${path}: ${pattern}`),
      ),
    ).toStrictEqual([]);
  });
});
