import { getResult, takeOne } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
// Bwrap prints `bwrap: execvp <cmd>: No such file or directory` and node's ENOENT surfaces as `spawn <cmd> ENOENT`
// When the intended executable is missing from PATH — both are the same user error: a package script (or a typo)
// Was passed where virrun expects a real executable, so the sandbox-setup message misleads. When the missing token
// Is a package.json script in `cwd`, point at the `virrun -- pnpm <script>` form that actually resolves.
const COMMAND_NOT_FOUND_REGEX =
  /(?:execvp (?<execvpCommand>\S+): No such file or directory|spawn (?<spawnCommand>\S+) ENOENT)/u;
const packageScriptsSchema = z.object({ scripts: z.record(z.string(), z.string()).default({}) });

const readPackageScripts = (cwd: string): string[] =>
  getResult(() => packageScriptsSchema.parse(JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")))).match(
    (packageJson) => Object.keys(packageJson.scripts),
    () => [],
  );

export const getCommandNotFoundHint = (
  command: readonly string[],
  errorMessage: string,
  cwd: string,
): string | undefined => {
  const match = COMMAND_NOT_FOUND_REGEX.exec(errorMessage);
  if (!match?.groups) return undefined;
  const missingCommand = match.groups.execvpCommand ?? match.groups.spawnCommand;
  // Only hint when the missing binary is the command the user actually asked to run — never an inner tool a
  // Legitimately-resolved executable failed to find — so the "did you mean pnpm" advice can't misfire.
  if (missingCommand !== takeOne(command, 0)) return undefined;
  const lead = `[virrun] "${missingCommand}" is not an executable — virrun runs commands, not package scripts.`;
  return readPackageScripts(cwd).includes(missingCommand)
    ? `${lead}\n[virrun] Did you mean:  virrun -- pnpm ${missingCommand}`
    : `${lead}\n[virrun] Pass a real executable, e.g. \`virrun -- pnpm ${missingCommand}\`, and check it is installed and spelled correctly.`;
};
