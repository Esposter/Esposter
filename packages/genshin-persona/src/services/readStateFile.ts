import { existsSync, readFileSync } from "node:fs";

// One state file's content as its writer meant it, or "" for a file not written yet: every reader of one checks
// What it reads for shape, so the absent file and the empty one are the same answer
export const readStateFile = (path: string): string => (existsSync(path) ? readFileSync(path, "utf8").trim() : "");
