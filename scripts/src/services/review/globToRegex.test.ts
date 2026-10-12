import { globToRegex } from "#src/services/review/globToRegex";
import { describe, expect, test } from "vitest";

describe(globToRegex, () => {
  test("a leading globstar takes any directory chain, including none", () => {
    expect.hasAssertions();

    const regex = globToRegex("**/CHANGELOG.md");

    expect(regex.test("CHANGELOG.md")).toBe(true);
    expect(regex.test("apps/web/CHANGELOG.md")).toBe(true);
    expect(regex.test("apps/web/CHANGELOG.mdx")).toBe(false);
  });

  test("a trailing globstar takes everything under its directory", () => {
    expect.hasAssertions();

    const regex = globToRegex("packages/genshin-persona/src/personaCards/**");

    expect(regex.test("packages/genshin-persona/src/personaCards/a/b.ts")).toBe(true);
    expect(regex.test("packages/genshin-persona/src/personaCards")).toBe(false);
  });

  test("a single star takes one path segment", () => {
    expect.hasAssertions();

    const regex = globToRegex("packages/*/src/index.test.ts");

    expect(regex.test("packages/shared/src/index.test.ts")).toBe(true);
    expect(regex.test("packages/a/b/src/index.test.ts")).toBe(false);
  });

  test("a dot is itself, not any character", () => {
    expect.hasAssertions();

    expect(globToRegex("pnpm-lock.yaml").test("pnpm-lockxyaml")).toBe(false);
  });
});
