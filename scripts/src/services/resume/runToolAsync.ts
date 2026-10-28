import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { execFile } from "@esposter/shared-node/child-process";
import { promisify } from "node:util";

// oxlint-disable-next-line typescript/strict-void-return -- promisify settles through the callback and never reads execFile's ChildProcess return, and a void wrapper would lose the promisify.custom that resolves { stdout } (packages/shared-node/src/services/childProcess/execFile.ts:13-15)
const execFileAsync = promisify(execFile);

// `git` or `gh` against the repository root, without blocking, so the checks' calls overlap
export const runToolAsync = async (file: string, args: string[]): Promise<string> => {
  const { stdout } = await execFileAsync(file, args, {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    env: getGitEnv(),
    maxBuffer: MAX_BUFFER_BYTES,
  });
  return stdout;
};
