import { GenshinVerbs } from "#src/models/GenshinVerb";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

// The README's verb tables are where a person reads the verbs, so they name every verb once and no other
describe("the verb tables", () => {
  test("name each GenshinVerb", () => {
    expect.hasAssertions();

    const readme = readFileSync(resolve(import.meta.dirname, "../../README.md"), "utf8");
    const namedVerbs = Array.from(readme.matchAll(/^\| `(?<verb>[a-z]+)`/gmu), ({ groups }) => groups?.verb);

    expect(new Set(namedVerbs)).toStrictEqual(new Set(GenshinVerbs));
  });
});
