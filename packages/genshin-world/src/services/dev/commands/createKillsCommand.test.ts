import { createKillsCommand } from "#src/services/dev/commands/createKillsCommand";
import { describe, expect, test } from "vitest";

describe(createKillsCommand, () => {
  test("a kills read counts the defeats the Archive holds", () => {
    expect.hasAssertions();

    const kills = new Map([
      [1, 2],
      [2, 1],
    ]);
    const result = createKillsCommand({ getKills: () => kills }).run({});

    expect(result).toStrictEqual({ ok: true, value: 3 });
  });
});
