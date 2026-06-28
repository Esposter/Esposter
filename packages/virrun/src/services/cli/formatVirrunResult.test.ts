import { formatVirrunResult } from "@/services/cli/formatVirrunResult";
import { describe, expect, test } from "vitest";

describe(formatVirrunResult, () => {
  test("joins a multi-token command and reports exit code and duration", () => {
    expect.hasAssertions();

    expect(formatVirrunResult({ command: ["oxfmt", "--check"], durationMs: 1234, exitCode: 0 })).toBe(
      '[virrun] "oxfmt --check" exited 0 in 1234ms',
    );
  });

  test("renders a non-zero exit code", () => {
    expect.hasAssertions();

    expect(formatVirrunResult({ command: ["node"], durationMs: 0, exitCode: 1 })).toBe(
      '[virrun] "node" exited 1 in 0ms',
    );
  });
});
