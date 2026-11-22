import type { SinsResult } from "../../models/SinsResult";

// The node script writes one JSON result when it exits cleanly, so a run that exited otherwise never reaches this
// oxlint-disable-next-line no-restricted-properties, typescript/no-unsafe-type-assertion -- packages/genshin-mods/package.json has no @esposter/shared dependency, so jsonDateParse is not importable here, and SinsResult (src/models/SinsResult.ts) holds no Date a revival would produce; the plugin carries no schema library to check the node script's answer, which is the one writer of it
export const parseSinsResult = (stdout: string): SinsResult => JSON.parse(stdout) as SinsResult;
