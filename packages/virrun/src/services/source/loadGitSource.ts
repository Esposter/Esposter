import type { GitSource } from "@/models/source/GitSource";
import type { LoadedSource } from "@/models/source/LoadedSource";

import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Shallow-clones a repo into a temp directory using the host's real git (via the native backend). A
// Non-zero clone exit fails loud with git's own stderr rather than handing back an empty directory.
// `-q` drops the volatile "Cloning into '<dest>'" progress line, leaving the actionable fatal lines.
export const loadGitSource = async (source: GitSource): Promise<LoadedSource> => {
  const cwd = await mkdtemp(join(tmpdir(), "sandbox-"));
  const dispose = () => rm(cwd, { force: true, recursive: true });
  // Argv form (shell: false): repo and ref are data, never shell-evaluated. The `--` terminates
  // Option parsing so a repo/ref like `--upload-pack=…` can't be smuggled in as a git flag either.
  const args = [
    "git",
    "clone",
    "-q",
    "--depth",
    "1",
    ...(source.ref === "" ? [] : ["--branch", source.ref]),
    "--",
    source.repo,
    cwd,
  ];
  const result = await getResultAsync(() => createNativeBackend().exec(args, { cwd: "", stdio: "pipe" }));
  if (result.isErr()) {
    await dispose();
    throw result.error;
  }
  const { exitCode, stderr } = result.value;
  if (exitCode !== 0) {
    await dispose();
    throw new InvalidOperationError(Operation.Read, source.repo, `git clone failed (exit ${exitCode}): ${stderr}`);
  }
  return { cwd, dispose };
};
