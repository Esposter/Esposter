import { getProvisionFailureMessage } from "#src/services/exec/snapshot/getProvisionFailureMessage";
import { describe, expect, test } from "vitest";

describe(getProvisionFailureMessage, () => {
  const label = "label";
  const execResult = { exitCode: 1, stderr: "stderr", stdout: "" };

  test("carries the retained stderr when nothing streamed it to the host", () => {
    expect.hasAssertions();

    expect(getProvisionFailureMessage(label, execResult, { cwd: "", stdio: "pipe" })).toBe(
      `${label} exited with 1: ${execResult.stderr}`,
    );
  });

  test("drops the retained stderr when the tee already printed it live", () => {
    expect.hasAssertions();

    expect(getProvisionFailureMessage(label, execResult, { cwd: "", stdio: "pipe", tee: "stderr" })).toBe(
      `${label} exited with 1:`,
    );
  });
});
