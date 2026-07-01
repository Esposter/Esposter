import type { DiagnosticCheck } from "@/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "@/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
import { getDoctorExitCode } from "@/services/cli/getDoctorExitCode";
import { describe, expect, test } from "vitest";

const createCheck = (status: DiagnosticStatus): DiagnosticCheck => ({
  fix: "",
  label: "check",
  note: "",
  status,
  type: DiagnosticCheckType.Bubblewrap,
});

describe(getDoctorExitCode, () => {
  test("returns 0 when every check is ok or not applicable", () => {
    expect.hasAssertions();

    expect(getDoctorExitCode([createCheck(DiagnosticStatus.Ok), createCheck(DiagnosticStatus.NotApplicable)])).toBe(0);
  });

  test("returns 1 when any check is missing", () => {
    expect.hasAssertions();

    expect(getDoctorExitCode([createCheck(DiagnosticStatus.Ok), createCheck(DiagnosticStatus.Missing)])).toBe(1);
  });
});
