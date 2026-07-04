// Paths are single-quoted before embedding in a sh script: double quotes still expand $(), backticks, and $VAR,
// So a repo path or WSL home with shell metacharacters would otherwise be interpreted (CWE-78). Single quotes suppress
// All expansion; an embedded `'` is closed, escaped, and reopened.
export const shellQuote = (value: string): string => `'${value.replaceAll("'", `'\\''`)}'`;
