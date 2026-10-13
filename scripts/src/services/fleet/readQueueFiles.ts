import type { QueueFile } from "#src/models/fleet/QueueFile";

import { MAX_BUFFER_BYTES, REMOTE_QUEUE_REF, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { runGit } from "#src/services/shared/runGit";
import { execFileSync } from "@esposter/shared-node/child-process";

const NEWLINE_BYTE = 0x0a;

// Every file under a folder as the queue branch on origin holds it, never as the checkout does: a checkout behind origin
// Still lists an item another worker finished and deleted, and the fleet would offer it again. The caller fetches first.
// One `git cat-file --batch` reads them all, each answered as a `<sha> blob <size>` line, its bytes and a newline, so the
// Output is cut by byte counts and stays a buffer until each file is cut from it
export const readQueueFiles = (
  directory: string,
  ref: string = REMOTE_QUEUE_REF,
  cwd: string = REPOSITORY_ROOT,
): QueueFile[] => {
  // `-z` names each path raw and NUL-ended, where a plain listing quotes and octal-escapes a non-ASCII one
  const paths = runGit(["ls-tree", "-r", "-z", "--name-only", ref, "--", directory], cwd).split("\0").filter(Boolean);
  const output = execFileSync("git", ["cat-file", "--batch"], {
    cwd,
    env: getGitEnv(),
    input: paths.map((path) => `${ref}:${path}\n`).join(""),
    maxBuffer: MAX_BUFFER_BYTES,
  });
  let offset = 0;
  return paths.map((path) => {
    const headerEnd = output.indexOf(NEWLINE_BYTE, offset);
    const size = Number(output.toString("utf8", offset, headerEnd).split(" ")[2]);
    const start = headerEnd + 1;
    offset = start + size + 1;
    return { path, text: output.toString("utf8", start, start + size) };
  });
};
