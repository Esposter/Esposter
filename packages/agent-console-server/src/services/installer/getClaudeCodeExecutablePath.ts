import { CLAUDE_CODE_EXECUTABLE_FILENAME } from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { join } from "node:path";
import { isSea } from "node:sea";

// Inside the single executable the SDK cannot find its own Claude Code binary, which it looks up beside its module,
// So the one the install wrote out is named; run from the package, the SDK finds its own
export const getClaudeCodeExecutablePath = (): string | undefined =>
  isSea() ? join(getHostInstallDirectory(), CLAUDE_CODE_EXECUTABLE_FILENAME) : undefined;
