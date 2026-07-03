import type { DiagnosticCheck } from "@/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "@/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatDoctorReport } from "@/services/cli/doctor/formatDoctorReport";
import { describe, expect, test } from "vitest";

const platform = "win32";
const okBubblewrap: DiagnosticCheck = {
  fix: "",
  label: "bubblewrap >= 0.10.0",
  note: "bubblewrap 0.11.1",
  status: DiagnosticStatus.Ok,
  type: DiagnosticCheckType.Bubblewrap,
};
const okSandbox: DiagnosticCheck = {
  fix: "",
  label: "overlay sandbox mount",
  note: "bubblewrap RAM overlay mounts",
  status: DiagnosticStatus.Ok,
  type: DiagnosticCheckType.Sandbox,
};

describe(formatDoctorReport, () => {
  test("renders an aligned ok row and a ready summary", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatDoctorReport({ checks: [okBubblewrap, okSandbox], platform }))).toBe(
      [
        "[virrun] doctor — os backend prerequisites (win32)",
        "  bubblewrap >= 0.10.0   ok       bubblewrap 0.11.1",
        "  overlay sandbox mount  ok       bubblewrap RAM overlay mounts",
        "[virrun] os backend ready — `virrun -- <cmd>` runs sandboxed",
      ].join("\n"),
    );
  });

  test("appends the fix line and reports fallback when the sandbox check is missing", () => {
    expect.hasAssertions();

    const missingSandbox: DiagnosticCheck = {
      fix: "enable unprivileged user namespaces + overlayfs",
      label: "overlay sandbox mount",
      note: "bwrap could not mount the RAM overlay",
      status: DiagnosticStatus.Missing,
      type: DiagnosticCheckType.Sandbox,
    };

    expect(stripAnsi(formatDoctorReport({ checks: [okBubblewrap, missingSandbox], platform }))).toBe(
      [
        "[virrun] doctor — os backend prerequisites (win32)",
        "  bubblewrap >= 0.10.0   ok       bubblewrap 0.11.1",
        "  overlay sandbox mount  MISSING  bwrap could not mount the RAM overlay",
        "      → enable unprivileged user namespaces + overlayfs",
        "[virrun] os backend unavailable — commands fall back to native (un-isolated)",
      ].join("\n"),
    );
  });

  test("reports a component gap distinctly from a fallback when the sandbox still mounts", () => {
    expect.hasAssertions();

    const missingPython: DiagnosticCheck = {
      fix: "install python3",
      label: "python3 (write-back)",
      note: "not found — write-back (persist) can't reconcile produced files",
      status: DiagnosticStatus.Missing,
      type: DiagnosticCheckType.Python3,
    };

    expect(stripAnsi(formatDoctorReport({ checks: [missingPython, okSandbox], platform }))).toContain(
      "[virrun] os backend mounts, but some commands will fail — see the checks above",
    );
  });
});
