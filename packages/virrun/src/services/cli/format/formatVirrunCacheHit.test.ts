import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatVirrunCacheHit } from "@/services/cli/format/formatVirrunCacheHit";
import { describe, expect, test } from "vitest";

describe(formatVirrunCacheHit, () => {
  test("joins a multi-token argv command", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunCacheHit(["oxfmt", "--check"]))).toBe(
      '[virrun] task cache hit — replaying "oxfmt --check"',
    );
  });

  test("renders a pre-joined string command as-is", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunCacheHit("pnpm lint"))).toBe('[virrun] task cache hit — replaying "pnpm lint"');
  });
});
