import { matchesRoute } from "@/services/configuration/matchesRoute";
import { describe, expect, test } from "vitest";

describe(matchesRoute, () => {
  test("matches when a route entry is a leading-token prefix of an argv command", () => {
    expect.hasAssertions();

    expect(matchesRoute(["pnpm", "install", "--frozen-lockfile"], ["pnpm install"])).toBe(true);
  });

  test("matches a string command on the same prefix rule", () => {
    expect.hasAssertions();

    expect(matchesRoute("vitest run foo.test.ts", ["vitest"])).toBe(true);
  });

  test("does not match a different command sharing only the first token", () => {
    expect.hasAssertions();

    expect(matchesRoute(["pnpm", "test"], ["pnpm install"])).toBe(false);
  });

  test("does not match when the entry is longer than the command", () => {
    expect.hasAssertions();

    expect(matchesRoute(["pnpm"], ["pnpm install"])).toBe(false);
  });

  test("never matches against an empty allowlist", () => {
    expect.hasAssertions();

    expect(matchesRoute(["vitest"], [])).toBe(false);
  });
});
