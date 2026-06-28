import { WSL_BWRAP_STATUS_BEGIN, WSL_BWRAP_STATUS_END } from "@/services/exec/bwrap/constants";
import { parseBwrapStderrStatus } from "@/services/exec/bwrap/parseBwrapStderrStatus";
import { describe, expect, test } from "vitest";

describe(parseBwrapStderrStatus, () => {
  test("extracts the bwrap status marker and preserves command stderr", () => {
    expect.hasAssertions();

    expect(
      parseBwrapStderrStatus(`stderr${WSL_BWRAP_STATUS_BEGIN}{"exit-code":0}\n${WSL_BWRAP_STATUS_END}`),
    ).toStrictEqual({
      status: `{"exit-code":0}\n`,
      stderr: "stderr",
    });
  });

  test("leaves stderr untouched when the marker is absent", () => {
    expect.hasAssertions();

    expect(parseBwrapStderrStatus("stderr")).toStrictEqual({ status: "", stderr: "stderr" });
  });
});
