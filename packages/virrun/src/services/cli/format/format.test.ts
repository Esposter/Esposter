import { BackendType } from "@/models/virrun/BackendType";
import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatVirrunBanner } from "@/services/cli/format/formatVirrunBanner";
import { formatVirrunCacheHit } from "@/services/cli/format/formatVirrunCacheHit";
import { formatVirrunDebug } from "@/services/cli/format/formatVirrunDebug";
import { formatVirrunNetworkHint } from "@/services/cli/format/formatVirrunNetworkHint";
import { formatVirrunPrepare } from "@/services/cli/format/formatVirrunPrepare";
import { formatVirrunProvisioning } from "@/services/cli/format/formatVirrunProvisioning";
import { formatVirrunResult } from "@/services/cli/format/formatVirrunResult";
import { describe, expect, test } from "vitest";
// Every CLI line builder is a pure template-string over the shared formatVirrunLine tag, so each one's whole
// Observable surface is a single color-stripped string — they share one file rather than one 1-test file each.
// The `[virrun] ` tag formatVirrunLine contributes is asserted inside every full-string expectation below.
// A 64-hex digest: both the prepare layer key and the provisioning lockfile hash are shortened to 12 chars.
const key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe(formatVirrunBanner, () => {
  test("joins a multi-token command and reports backend and node version", () => {
    expect.hasAssertions();

    expect(
      stripAnsi(formatVirrunBanner({ backend: BackendType.Os, command: ["oxfmt", "--check"], nodeVersion: "v26.4.0" })),
    ).toBe('[virrun] running "oxfmt --check" (backend=os, node=v26.4.0)');
  });
});

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

describe(formatVirrunDebug, () => {
  test("prefixes the message with the virrun tag and debug label", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunDebug("task cache off"))).toBe("[virrun] debug — task cache off");
  });
});

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

describe(formatVirrunPrepare, () => {
  test("announces a prepare cache miss when the layer does not exist", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunPrepare({ exists: false, key }))).toBe(
      "[virrun] prepare cache miss (source 0123456789ab) — regenerating framework artifacts once",
    );
  });

  test("announces a prepare cache hit when the layer is warm", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunPrepare({ exists: true, key }))).toBe(
      "[virrun] prepare cache hit (source 0123456789ab)",
    );
  });
});

describe(formatVirrunProvisioning, () => {
  test("announces a snapshot cache miss when no snapshot exists", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunProvisioning({ exists: false, hash: key }))).toBe(
      "[virrun] snapshot cache miss (environment 0123456789ab) — installing toolchain once (may take minutes); later runs reuse it",
    );
  });

  test("announces a snapshot cache hit when the snapshot is warm", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunProvisioning({ exists: true, hash: key }))).toBe(
      "[virrun] snapshot cache hit (environment 0123456789ab)",
    );
  });
});

describe(formatVirrunResult, () => {
  test("joins a multi-token command and reports exit code and duration", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunResult({ command: ["oxfmt", "--check"], durationMs: 1234, exitCode: 0 }))).toBe(
      '[virrun] "oxfmt --check" exited 0 in 1234ms',
    );
  });
});
