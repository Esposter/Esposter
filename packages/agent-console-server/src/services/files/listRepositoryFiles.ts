import { REPOSITORY_WALK_IGNORED_NAMES } from "#src/services/files/constants";
import { getResultAsync } from "@esposter/shared";
import { execFile } from "@esposter/shared-node/child-process";
import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Every file a repository tracks or has not yet ignored, as git lists them. Outside a repository, a walk of the
// Directory lists the same files, minus what the walk ignores
const listGitFiles = async (cwd: string): Promise<string[]> => {
  const { stdout } = await execFileAsync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd });
  return stdout.split("\0").filter(Boolean);
};

const walkFiles = async (root: string, directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => relative(root, join(directory, entry.name)));
  const subdirectories = entries.filter(
    (entry) => entry.isDirectory() && !REPOSITORY_WALK_IGNORED_NAMES.has(entry.name),
  );
  const nested = await Promise.all(subdirectories.map((entry) => walkFiles(root, join(directory, entry.name))));
  return [...files, ...nested.flat()];
};

// Forward slashes whichever the platform, so a path the page shows and mentions is the same on every machine
export const listRepositoryFiles = async (cwd: string): Promise<string[]> => {
  const gitFiles = await getResultAsync(() => listGitFiles(cwd)).unwrapOr(undefined);
  const files = gitFiles ?? (await walkFiles(cwd, cwd));
  return files.map((file) => file.split(sep).join("/")).toSorted();
};
