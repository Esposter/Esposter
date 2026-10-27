import type { SinsResult } from "../../models/SinsResult";

// The node script writes one JSON result when it exits cleanly, so a run that exited otherwise never reaches this
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The script's own result, whose shape the script writes
export const parseSinsResult = (stdout: string): SinsResult => JSON.parse(stdout) as SinsResult;
