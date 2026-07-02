import { formatVirrunCacheHit } from "@/services/cli/formatVirrunCacheHit";
import { describe, expect, test } from "vitest";

describe(formatVirrunCacheHit, () => {
  test("joins a multi-token argv command", () => {
    expect.hasAssertions();

    expect(formatVirrunCacheHit(["oxfmt", "--check"])).toBe('[virrun] task cache hit — replaying "oxfmt --check"');
  });

  test("renders a pre-joined string command as-is", () => {
    expect.hasAssertions();

    expect(formatVirrunCacheHit("pnpm lint")).toBe('[virrun] task cache hit — replaying "pnpm lint"');
  });
});
