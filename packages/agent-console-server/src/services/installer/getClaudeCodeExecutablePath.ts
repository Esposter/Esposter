import { CLAUDE_CODE_EXECUTABLE_FILENAME } from "#src/services/installer/constants";
import { dirname, join } from "node:path";
import { isSea } from "node:sea";

// Inside the single executable the SDK cannot find its own Claude Code binary, which it looks up beside its module,
// So the one installed beside the executable is named; run from the package, the SDK finds its own
export const getClaudeCodeExecutablePath = (): string | undefined =>
  isSea() ? join(dirname(process.execPath), CLAUDE_CODE_EXECUTABLE_FILENAME) : undefined;
