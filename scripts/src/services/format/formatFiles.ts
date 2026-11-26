import { checkIsComponentPath } from "#src/services/format/checkIsComponentPath";
import { checkIsRewritten } from "#src/services/format/checkIsRewritten";
import { chunkPaths } from "#src/services/format/chunkPaths";
import { listDifferent } from "#src/services/format/listDifferent";
import { readFormattableText } from "#src/services/format/readFormattableText";
import { readFormattedSource } from "#src/services/format/readFormattedSource";
import { writeFormatted } from "#src/services/format/writeFormatted";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Formats each given file in place and returns how many it rewrote. A file that is already as the formatter writes it
// Is left alone, so its mtime does not move. Oxfmt runs once per run of paths rather than once per file. A run it
// Cannot finish is formatted one file at a time, writing each as it goes, so the first file that stops it is the one
// Named, and the files before it are rewritten as they were before runs. A component is vize's, which oxfmt ignores,
// So it is formatted one file at a time too
export const formatFiles = (repositoryPaths: string[], repositoryRoot: string, mainCheckoutRoot: string): number => {
  const writeEachFormatted = (paths: string[]): number => {
    let count = 0;
    for (const repositoryPath of paths) {
      const source = readFormattedSource(repositoryPath, repositoryRoot, mainCheckoutRoot);
      if (checkIsRewritten(source)) {
        writeFileSync(join(repositoryRoot, repositoryPath), source.formatted);
        count += 1;
      }
    }
    return count;
  };
  const formattablePaths = repositoryPaths.filter((path) => readFormattableText(path, repositoryRoot) !== undefined);
  let rewrittenCount = writeEachFormatted(formattablePaths.filter((path) => checkIsComponentPath(path)));
  for (const chunk of chunkPaths(formattablePaths.filter((path) => !checkIsComponentPath(path)))) {
    const unformattedPaths = listDifferent(chunk, repositoryRoot, mainCheckoutRoot);
    if (unformattedPaths === undefined) {
      rewrittenCount += writeEachFormatted(chunk);
      continue;
    }
    if (unformattedPaths.length > 0) writeFormatted(unformattedPaths, repositoryRoot, mainCheckoutRoot);
    rewrittenCount += unformattedPaths.length;
  }
  return rewrittenCount;
};
