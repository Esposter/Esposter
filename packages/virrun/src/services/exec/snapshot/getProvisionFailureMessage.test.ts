import { getProvisionFailureMessage } from "#src/services/exec/snapshot/getProvisionFailureMessage";
import { describe, expect, test } from "vitest";

describe(getProvisionFailureMessage, () => {
  const label = "snapshot setup command";
  const result = { exitCode: 1, stderr: "boom", stdout: "" };

  test("carries the retained stderr when nothing streamed it to the host", () => {
    expect.hasAssertions();

    expect(getProvisionFailureMessage(label, result, { cwd: "", stdio: "pipe" })).toBe(`${label} exited with 1: boom`);
  });

  test("drops the retained stderr when the tee already printed it live", () => {
    expect.hasAssertions();

    expect(getProvisionFailureMessage(label, result, { cwd: "", stdio: "pipe", tee: "stderr" })).toBe(
      `${label} exited with 1:`,
    );
  });
});
