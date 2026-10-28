import type { SinsResult } from "../../models/SinsResult";

// The node script writes one JSON result when it exits cleanly, so a run that exited otherwise never reaches this
// oxlint-disable-next-line eslint/no-restricted-properties -- packages/genshin-mods/package.json has no @esposter/shared dependency, so jsonDateParse is not importable here, and SinsResult (src/models/SinsResult.ts) holds no Date a revival would produce
export const parseSinsResult = (stdout: string): SinsResult => JSON.parse(stdout) as SinsResult;
