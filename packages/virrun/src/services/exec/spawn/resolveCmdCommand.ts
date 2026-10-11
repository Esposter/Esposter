import type { ResolveCmdCommandOptions } from "#src/models/exec/spawn/ResolveCmdCommandOptions";

import { existsSync, statSync } from "node:fs";
import { delimiter, resolve } from "node:path";

const DEFAULT_PATH_EXTENSIONS = ".COM;.EXE;.BAT;.CMD";
const PATH_SEPARATOR_REGEX = /[\\/]/u;

// Windows environment names are case-insensitive, so a caller's `Path` is the PATH a `PATH` lookup means.
const getEnvironmentValue = (env: NodeJS.ProcessEnv, name: string): string | undefined => {
  const key = Object.keys(env).find((candidate) => candidate.toUpperCase() === name);
  return key === undefined ? undefined : env[key];
};

// Finds the file a win32 spawn of `command` runs, the way `which` does with PATHEXT: a name already carrying one of its
// Extensions is tried as given, any other has each extension appended, and a name with a separator is looked up under
// The working directory rather than PATH. Undefined when no such file exists, which the caller reports as not found.
export const resolveCmdCommand = (command: string, options: ResolveCmdCommandOptions = {}): string | undefined => {
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const extensions = (getEnvironmentValue(env, "PATHEXT") ?? DEFAULT_PATH_EXTENSIONS).split(";").filter(Boolean);
  const hasExtension = extensions.some((extension) => command.toLowerCase().endsWith(extension.toLowerCase()));
  const names = hasExtension ? [command] : extensions.map((extension) => `${command}${extension}`);
  const directories = PATH_SEPARATOR_REGEX.test(command)
    ? [""]
    : (getEnvironmentValue(env, "PATH") ?? "").split(delimiter).filter(Boolean);
  for (const directory of directories)
    for (const name of names) {
      const candidate = resolve(cwd, directory, name);
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  return undefined;
};
