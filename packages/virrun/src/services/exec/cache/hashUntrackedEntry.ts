import { getResult } from "@esposter/shared";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";
// Hash one untracked entry's identity: its symlink target, or its file content, or a mode marker for anything else
// (a directory/socket git may list under an odd path). Unreadable (permission denied) falls back to a constant so a
// Non-input the command can't read either never fails the hash. Combined with its path by the caller, so distinct
// Paths never collide even when their markers match.
export const hashUntrackedEntry = (fullPath: string): string =>
  getResult(() => {
    const stats = lstatSync(fullPath);
    if (stats.isSymbolicLink()) return `l:${readlinkSync(fullPath)}`;
    else if (stats.isFile()) return `f:${createHash("sha256").update(readFileSync(fullPath)).digest("hex")}`;
    else return `s:${stats.mode}`;
  }).unwrapOr("unreadable");
