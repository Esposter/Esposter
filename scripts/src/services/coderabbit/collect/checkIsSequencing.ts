import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runGit } from "#src/services/shared/runGit";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// The heads git keeps while a cherry-pick, merge or rebase is open
const IN_PROGRESS_HEADS: string[] = ["CHERRY_PICK_HEAD", "MERGE_HEAD", "REBASE_HEAD"];
// Whether git still holds an operation open — stopped on a conflict, or left by a session that never ran it to
// The end. A session's clean exit proves nothing on its own; a tree with nothing in progress does.
export const checkIsSequencing = (cwd?: string): boolean =>
  IN_PROGRESS_HEADS.some((head) => readSha(head, cwd) !== undefined) ||
  existsSync(resolve(cwd ?? ".", runGit(["rev-parse", "--git-path", "sequencer"], cwd).trim()));
