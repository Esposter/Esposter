// The path-scoped forms that do the same job for the paths the session touched, named for the person's shared checkout
export const getWholeIndexDenyReason = (form: string, peerPath: string): string =>
  [
    `Refused: \`${form}\` reaches the staged and working changes of another session in this checkout, which is editing ${peerPath} now. Name the paths you touched instead:`,
    "- `git add <path>` to stage them;",
    "- `git reset -- <path>` to unstage them;",
    '- `git commit -m "…" -- <path>` to commit only them.',
    "The git skill's rule (`.agents/skills/git/SKILL.md`) owns the whole-index list.",
  ].join("\n");
