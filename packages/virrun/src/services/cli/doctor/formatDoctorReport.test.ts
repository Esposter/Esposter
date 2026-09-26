import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { stripAnsi } from "#src/services/cli/color/stripAnsi.test";
import { formatDoctorReport } from "#src/services/cli/doctor/formatDoctorReport";
import { describe, expect, test } from "vitest";

describe(formatDoctorReport, () => {
  const platform = "platform";
  // Two labels of different lengths, so the column alignment the rows share is what the expected lines read
  const okBubblewrap: DiagnosticCheck = {
    fix: "",
    label: "a",
    note: "note",
    status: DiagnosticStatus.Ok,
    type: DiagnosticCheckType.Bubblewrap,
  };
  const okSandbox: DiagnosticCheck = {
    fix: "",
    label: "aa",
    note: "note",
    status: DiagnosticStatus.Ok,
    type: DiagnosticCheckType.Sandbox,
  };

  test("renders an aligned ok row and a ready summary", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatDoctorReport({ checks: [okBubblewrap, okSandbox], platform }))).toBe(
      [
        "[virrun] doctor — os backend prerequisites (platform)",
        "  a   ok       note",
        "  aa  ok       note",
        "[virrun] os backend ready — `virrun -- <cmd>` runs sandboxed",
      ].join("\n"),
    );
  });

  test.each([DiagnosticCheckType.Sandbox, DiagnosticCheckType.Wsl])(
    "appends the fix line and reports fallback when the %s check is missing",
    (type) => {
      expect.hasAssertions();

      const missingCheck: DiagnosticCheck = { ...okSandbox, fix: "fix", status: DiagnosticStatus.Missing, type };

      expect(stripAnsi(formatDoctorReport({ checks: [okBubblewrap, missingCheck], platform }))).toBe(
        [
          "[virrun] doctor — os backend prerequisites (platform)",
          "  a   ok       note",
          "  aa  MISSING  note",
          "      → fix",
          "[virrun] os backend unavailable — commands fall back to native (un-isolated)",
        ].join("\n"),
      );
    },
  );

  test("reports a component gap distinctly from a fallback when the sandbox still mounts", () => {
    expect.hasAssertions();

    const missingPython: DiagnosticCheck = {
      ...okBubblewrap,
      fix: "fix",
      status: DiagnosticStatus.Missing,
      type: DiagnosticCheckType.Python3,
    };

    expect(stripAnsi(formatDoctorReport({ checks: [missingPython, okSandbox], platform }))).toBe(
      [
        "[virrun] doctor — os backend prerequisites (platform)",
        "  a   MISSING  note",
        "      → fix",
        "  aa  ok       note",
        "[virrun] os backend mounts, but some commands will fail — see the checks above",
      ].join("\n"),
    );
  });
});
