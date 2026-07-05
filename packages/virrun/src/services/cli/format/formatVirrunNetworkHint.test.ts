import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatVirrunNetworkHint } from "@/services/cli/format/formatVirrunNetworkHint";
import { describe, expect, test } from "vitest";

describe(formatVirrunNetworkHint, () => {
  test("names the command and points at the native / --no-cache escapes", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunNetworkHint("pnpm outdated -r"))).toMatchInlineSnapshot();
  });

  test("joins an argv command for display", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunNetworkHint(["tsx", "scripts/checkDependencies/index.ts"]))).toMatchInlineSnapshot();
  });
});
