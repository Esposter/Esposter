// Claude Code names a checkout's folder under `~/.claude/projects` by its path, with each `/` and `.` made a `-`
export const getClaudeProjectSlug = (path: string): string => path.replaceAll(/[/.]/gu, "-");
