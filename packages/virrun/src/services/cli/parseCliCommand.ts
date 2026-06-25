// Extracts the command argv from the process arguments (already sliced past node + script). Everything
// After the first `--` is the command; with no `--` the whole argv is the command. Returned as a token
// Array — never joined into a string — so the caller forwards it to exec with shell: false and the
// Argument boundaries survive. Joining into one string would push it through `/bin/sh -c`, which
// Re-tokenizes on whitespace and expands metacharacters: a literal arg like `hello world.txt` would
// Split into two, and `*`/`?` would glob. An empty array means no command was given.
export const parseCliCommand = (argv: readonly string[]): string[] => {
  const separatorIndex = argv.indexOf("--");
  return separatorIndex === -1 ? [...argv] : argv.slice(separatorIndex + 1);
};
