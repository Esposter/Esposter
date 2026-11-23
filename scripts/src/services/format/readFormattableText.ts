import { lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";

// A file's text, or none for a file the formatter does not format: a link, which git keeps as its target's path rather than
// As text (an installer's link to a skill directory is one), or a binary file, which has no text to format. A text file
// Never holds a NUL byte, so one anywhere in the buffer makes the file binary
export const readFormattableText = (relativePath: string, repositoryRoot: string): string | undefined => {
  const path = join(repositoryRoot, relativePath);
  if (!lstatSync(path).isFile()) return undefined;
  const buffer = readFileSync(path);
  if (buffer.includes(0)) return undefined;
  return buffer.toString("utf8");
};
