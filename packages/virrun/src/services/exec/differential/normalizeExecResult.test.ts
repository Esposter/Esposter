import type { NormalizationRule } from "#src/models/exec/differential/NormalizationRule";

import { DIGIT_SEQUENCE_RULE } from "#src/services/exec/differential/differentialCorpus.test";
import { normalizeExecResult } from "#src/services/exec/differential/normalizeExecResult";
import { describe, expect, test } from "vitest";

describe(normalizeExecResult, () => {
  test("returns the result unchanged when no rules are supplied", () => {
    expect.hasAssertions();

    const result = { exitCode: 0, stderr: "1", stdout: "1" };

    expect(normalizeExecResult(result, [])).toStrictEqual(result);
  });

  test("applies a rule to every match in both stdout and stderr", () => {
    expect.hasAssertions();

    const result = { exitCode: 0, stderr: "1 1", stdout: "a 1" };

    expect(normalizeExecResult(result, [DIGIT_SEQUENCE_RULE])).toStrictEqual({
      exitCode: 0,
      stderr: "<digits> <digits>",
      stdout: "a <digits>",
    });
  });

  test("collapses two results whose only difference is a masked timestamp", () => {
    expect.hasAssertions();

    const first = { exitCode: 0, stderr: "", stdout: "0" };
    const second = { exitCode: 0, stderr: "", stdout: "1" };

    expect(normalizeExecResult(first, [DIGIT_SEQUENCE_RULE])).toStrictEqual(
      normalizeExecResult(second, [DIGIT_SEQUENCE_RULE]),
    );
  });

  test("never rewrites the exit code", () => {
    expect.hasAssertions();

    const result = { exitCode: 1, stderr: "", stdout: "1" };

    expect(normalizeExecResult(result, [DIGIT_SEQUENCE_RULE]).exitCode).toBe(1);
  });

  test("applies rules in order so an earlier substitution feeds the next", () => {
    expect.hasAssertions();

    const rules: NormalizationRule[] = [
      { pattern: /\d+/gu, placeholder: "N" },
      { pattern: /N/gu, placeholder: "<num>" },
    ];
    const result = { exitCode: 0, stderr: "", stdout: "1" };

    expect(normalizeExecResult(result, rules).stdout).toBe("<num>");
  });
});
