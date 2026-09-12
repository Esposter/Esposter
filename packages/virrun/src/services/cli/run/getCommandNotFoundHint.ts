import { Color } from "#src/models/cli/Color";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
import { readPackageScripts } from "#src/services/cli/run/readPackageScripts";
import { takeOne } from "@esposter/shared";
// The sandbox prints `bwrap: execvp <cmd>: No such file or directory` and node's ENOENT surfaces as `spawn <cmd> ENOENT`
// When the intended executable is missing from PATH — both are the same user error: a package script (or a typo)
// Was passed where virrun expects a real executable, so the sandbox-setup message misleads. When the missing token
// Is a package.json script in `cwd`, point at the `virrun -- pnpm <script>` form that actually resolves.
const COMMAND_NOT_FOUND_REGEX =
  /(?:execvp (?<execvpCommand>\S+): No such file or directory|spawn (?<spawnCommand>\S+) ENOENT)/u;
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
  const suggestion = colorize(`virrun -- pnpm ${missingCommand}`, Color.Yellow);
  const lead = formatVirrunLine(
    `"${colorize(missingCommand, Color.Yellow)}" is not an executable — virrun runs commands, not package scripts.`,
  );
  return readPackageScripts(cwd).includes(missingCommand)
    ? `${lead}\n${formatVirrunLine(`Did you mean:  ${suggestion}`)}`
    : `${lead}\n${formatVirrunLine(`Pass a real executable, e.g. \`${suggestion}\`, and check it is installed and spelled correctly.`)}`;
};
