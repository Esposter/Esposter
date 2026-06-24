import { parseBwrapExitCode } from "@/services/exec/parseBwrapExitCode";
import { describe, expect, test } from "vitest";

describe(parseBwrapExitCode, () => {
  test("reads the child exit code from a json-status stream", () => {
    expect.hasAssertions();

    expect(parseBwrapExitCode(`{"child-pid":42}\n{"exit-code":7}\n`)).toBe(7);
  });

  test("returns undefined when no exit code was reported (sandbox never started the child)", () => {
    expect.hasAssertions();

    expect(parseBwrapExitCode(`{"child-pid":42}\n`)).toBeUndefined();
  });

  test("ignores malformed lines", () => {
    expect.hasAssertions();

    expect(parseBwrapExitCode(`not json\n{"exit-code":0}`)).toBe(0);
  });
});
