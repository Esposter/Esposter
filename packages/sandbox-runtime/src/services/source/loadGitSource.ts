import type { GitSource } from "@/models/source/GitSource";
import type { LoadedSource } from "@/models/source/LoadedSource";

import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Shallow-clones a repo into a temp directory using the host's real git (via the native backend). A
// Non-zero clone exit fails loud with git's own stderr rather than handing back an empty directory.
// `-q` drops the volatile "Cloning into '<dest>'" progress line, leaving the actionable fatal lines.
export const loadGitSource = async (source: GitSource): Promise<LoadedSource> => {
  const cwd = await mkdtemp(join(tmpdir(), "sandbox-"));
  const branch = source.ref === "" ? "" : `--branch ${source.ref} `;
  const command = `git clone -q --depth 1 ${branch}${source.repo} ${cwd}`;
  const { exitCode, stderr } = await createNativeBackend().exec(command, { cwd: "", stdio: "pipe" });
  if (exitCode !== 0) {
    await rm(cwd, { force: true, recursive: true });
    throw new InvalidOperationError(Operation.Read, source.repo, `git clone failed (exit ${exitCode}): ${stderr}`);
  }
  return {
    cwd,
    dispose: () => rm(cwd, { force: true, recursive: true }),
  };
};
