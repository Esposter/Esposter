import { checkIsRewritten } from "#src/services/format/checkIsRewritten";
import { chunkPaths } from "#src/services/format/chunkPaths";
import { listDifferent } from "#src/services/format/listDifferent";
import { readFormattableText } from "#src/services/format/readFormattableText";
import { readFormattedSource } from "#src/services/format/readFormattedSource";
import { writeFormatted } from "#src/services/format/writeFormatted";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Formats each given file in place and returns how many it rewrote. A file that is already as the formatter writes it
// Is Left alone, so its mtime does not move. The formatter runs once per run of paths rather than once per file. A run
// It Cannot finish is formatted one file at a time, writing each as it goes, so the first file that stops it is the one
// Named, and the files before it are rewritten as they were before runs
export const formatFiles = (repositoryPaths: string[], repositoryRoot: string, mainCheckoutRoot: string): number => {
  let rewrittenCount = 0;
  const formattablePaths = repositoryPaths.filter((path) => readFormattableText(path, repositoryRoot) !== undefined);
  for (const chunk of chunkPaths(formattablePaths)) {
    const unformattedPaths = listDifferent(chunk, repositoryRoot, mainCheckoutRoot);
    if (unformattedPaths !== undefined) {
      if (unformattedPaths.length > 0) writeFormatted(unformattedPaths, repositoryRoot, mainCheckoutRoot);
      rewrittenCount += unformattedPaths.length;
      continue;
    }
    for (const repositoryPath of chunk) {
      const source = readFormattedSource(repositoryPath, repositoryRoot, mainCheckoutRoot);
      if (checkIsRewritten(source)) {
        writeFileSync(join(repositoryRoot, repositoryPath), source.formatted);
        rewrittenCount += 1;
      }
    }
  }
  return rewrittenCount;
};
