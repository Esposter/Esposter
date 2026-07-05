import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatVirrunNetworkHint } from "@/services/cli/format/formatVirrunNetworkHint";
import { describe, expect, test } from "vitest";

describe(formatVirrunNetworkHint, () => {
  test("names the command and points at the native / --no-cache escapes", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunNetworkHint("pnpm outdated -r"))).toMatchInlineSnapshot(`
      "[virrun] "pnpm outdated -r" tried to use the network, but cached runs are sandboxed offline so results stay reproducible.
      [virrun] If it needs the network, run it natively — drop the virrun -- prefix — or, to keep the sandbox, re-run uncached with virrun --no-cache -- (or VIRRUN_NO_CACHE=1)."
    `);
  });

  test("joins an argv command for display", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunNetworkHint(["tsx", "scripts/checkDependencies/index.ts"]))).toMatchInlineSnapshot(`
      "[virrun] "tsx scripts/checkDependencies/index.ts" tried to use the network, but cached runs are sandboxed offline so results stay reproducible.
      [virrun] If it needs the network, run it natively — drop the virrun -- prefix — or, to keep the sandbox, re-run uncached with virrun --no-cache -- (or VIRRUN_NO_CACHE=1)."
    `);
  });
});
