import { readFormattedSource } from "#src/services/format/readFormattedSource";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Formats each given file in place and returns how many it rewrote. A file that is already as the formatter writes it is
// Left alone, so its mtime does not move
export const formatFiles = (repositoryPaths: string[], repositoryRoot: string, mainCheckoutRoot: string): number => {
  let rewrittenCount = 0;
  for (const repositoryPath of repositoryPaths) {
    const source = readFormattedSource(repositoryPath, repositoryRoot, mainCheckoutRoot);
    if (source !== undefined && source.formatted !== source.original) {
      writeFileSync(join(repositoryRoot, repositoryPath), source.formatted);
      rewrittenCount += 1;
    }
  }
  return rewrittenCount;
};
