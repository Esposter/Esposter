import { formatDoctorReport } from "@/services/cli/doctor/formatDoctorReport";
import { getDoctorExitCode } from "@/services/cli/doctor/getDoctorExitCode";
import { probeOsBackendChecks } from "@/services/cli/doctor/probeOsBackendChecks";
// Backs `virrun doctor`: gathers the os-backend prerequisite probes (IO), renders the report to stderr (like the
// Other `[virrun]` diagnostics), and returns a scriptable exit code (0 = every applicable check passed).
export const runDoctor = (): number => {
  const checks = probeOsBackendChecks();
  process.stderr.write(`${formatDoctorReport({ checks, platform: process.platform })}\n`);
  return getDoctorExitCode(checks);
};
