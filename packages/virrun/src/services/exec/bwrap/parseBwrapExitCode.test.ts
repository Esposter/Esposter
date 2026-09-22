import { parseBwrapExitCode } from "#src/services/exec/bwrap/parseBwrapExitCode";
import { describe, expect, test } from "vitest";

describe(parseBwrapExitCode, () => {
  test("reads the child exit code from a json-status stream", () => {
    expect.hasAssertions();

    expect(parseBwrapExitCode(`{"child-pid":0}\n{"exit-code":1}\n`)).toBe(1);
  });

  test("returns undefined when no exit code was reported (sandbox never started the child)", () => {
    expect.hasAssertions();

    expect(parseBwrapExitCode(`{"child-pid":0}\n`)).toBeUndefined();
  });

  test("ignores malformed lines", () => {
    expect.hasAssertions();

    expect(parseBwrapExitCode(`a\n{"exit-code":0}`)).toBe(0);
  });
});
