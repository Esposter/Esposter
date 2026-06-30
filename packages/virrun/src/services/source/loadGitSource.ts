import type { GitSource } from "@/models/source/GitSource";
import type { LoadedSource } from "@/models/source/LoadedSource";

import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Shallow-clones a repo into a temp dir via the host's real git, failing loud with git's own stderr on a
// Non-zero exit. `-q` drops the volatile "Cloning into '<dest>'" progress line, leaving the fatal lines.
export const loadGitSource = async (source: GitSource): Promise<LoadedSource> => {
  const cwd = await mkdtemp(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  const dispose = () => rm(cwd, { force: true, recursive: true });
  // Argv form (shell: false) keeps repo/ref as data; `--` ends option parsing so a `--upload-pack=…`-style
  // Repo/ref can't be smuggled in as a git flag.
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
