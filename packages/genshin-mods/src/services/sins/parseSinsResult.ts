import type { SinsResult } from "../../models/SinsResult";

// The node script writes one JSON result when it exits cleanly, so a run that exited otherwise never reaches this
export const parseSinsResult = (stdout: string): SinsResult => JSON.parse(stdout) as SinsResult;
