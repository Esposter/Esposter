import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

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
