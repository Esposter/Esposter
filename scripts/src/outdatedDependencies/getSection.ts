// The `\r?` is not made redundant by `.gitattributes` pinning the yaml this reads to `eol=lf`: an editor that
// Rewrites it on save is not git, and an LF-only match would return an empty section rather than fail.
export const getSection = (name: string, text: string): string =>
  new RegExp(`^${name}:\\r?\\n(?<section>[\\s\\S]*?)(?=^\\S|(?![\\s\\S]))`, "mu").exec(text)?.groups?.section ?? "";
