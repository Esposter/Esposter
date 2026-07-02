import type { NormalizationRule } from "@/models/exec/differential/NormalizationRule";

import { normalizeExecResult } from "@/services/exec/differential/normalizeExecResult";
import { describe, expect, test } from "vitest";

describe(normalizeExecResult, () => {
  const DIGITS_RULE: NormalizationRule = { pattern: /\d+/gu, placeholder: "<digits>" };

  test("returns the result unchanged when no rules are supplied", () => {
    expect.hasAssertions();

    const result = { exitCode: 0, stderr: "warn 12", stdout: "out 34" };

    expect(normalizeExecResult(result, [])).toStrictEqual(result);
  });

  test("applies a rule to every match in both stdout and stderr", () => {
    expect.hasAssertions();

    const result = { exitCode: 0, stderr: "at 99 and 100", stdout: "epoch 1719600000" };

    expect(normalizeExecResult(result, [DIGITS_RULE])).toStrictEqual({
      exitCode: 0,
      stderr: "at <digits> and <digits>",
      stdout: "epoch <digits>",
    });
  });

  test("collapses two results whose only difference is a masked timestamp", () => {
    expect.hasAssertions();

    const first = { exitCode: 0, stderr: "", stdout: "1719600000" };
    const second = { exitCode: 0, stderr: "", stdout: "1719600001" };

    expect(normalizeExecResult(first, [DIGITS_RULE])).toStrictEqual(normalizeExecResult(second, [DIGITS_RULE]));
  });

  test("never rewrites the exit code", () => {
    expect.hasAssertions();

    const result = { exitCode: 7, stderr: "", stdout: "7" };

    expect(normalizeExecResult(result, [DIGITS_RULE]).exitCode).toBe(7);
  });

  test("applies rules in order so an earlier substitution feeds the next", () => {
    expect.hasAssertions();

    const rules: NormalizationRule[] = [
      { pattern: /\d+/gu, placeholder: "N" },
      { pattern: /N/gu, placeholder: "<num>" },
    ];
    const result = { exitCode: 0, stderr: "", stdout: "42" };

    expect(normalizeExecResult(result, rules).stdout).toBe("<num>");
  });
});
