// Claude Code names a checkout's folder under `~/.claude/projects` by its path.
// Each character that is not a letter or a digit is made a `-`.
export const getClaudeProjectSlug = (path: string): string => path.replaceAll(/[^a-z\d]/giu, "-");
