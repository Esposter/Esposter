import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { getDoctorExitCode } from "#src/services/cli/doctor/getDoctorExitCode";
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
