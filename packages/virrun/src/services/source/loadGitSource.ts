import type { GitSource } from "#src/models/source/GitSource";
import type { LoadedSource } from "#src/models/source/LoadedSource";

import { createNativeBackend } from "#src/services/exec/native/createNativeBackend";
import { createTemporarySourceDirectory } from "#src/services/source/createTemporarySourceDirectory";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
// Shallow-clones a repo into a temp dir via the host's real git, failing loud with git's own stderr on a
// Non-zero exit. `-q` drops the volatile "Cloning into '<dest>'" progress line, leaving the fatal lines.
export const loadGitSource = async (source: GitSource): Promise<LoadedSource> => {
  const { cwd, dispose } = await createTemporarySourceDirectory();
  // Argv form (shell: false) keeps repo/ref as data; `--` ends option parsing so a `--upload-pack=…`-style
  // Repo/ref can't be smuggled in as a git flag.
  const command = [
    "git",
    "clone",
    "-q",
    "--depth",
    "1",
    ...(source.ref ? ["--branch", source.ref] : []),
    "--",
    source.repo,
    cwd,
  ];
  const { exitCode, stderr } = await getResultAsync(() =>
    createNativeBackend().exec(command, { cwd: "", stdio: "pipe" }),
  ).match(
    (value) => value,
    async (error) => {
      await dispose();
      throw error;
    },
  );
  if (exitCode !== 0) {
    await dispose();
    throw new InvalidOperationError(Operation.Read, source.repo, `git clone failed (exit ${exitCode}): ${stderr}`);
  }
  return { cwd, dispose };
};
