import { runGitBytes } from "#src/services/hooks/stagedImports/runGitBytes";

const LINE_FEED = 0x0a;

// The contents of each path as the index holds it, read in one `git cat-file` process; a path the index does not hold
// Maps to undefined
export const readIndexBlobs = (paths: readonly string[]): Map<string, string | undefined> => {
  const blobs = new Map<string, string | undefined>();
  if (paths.length === 0) return blobs;
  const output = runGitBytes(["cat-file", "--batch"], paths.map((path) => `:${path}\n`).join(""));
  let offset = 0;
  for (const path of paths) {
    const headerEnd = output.indexOf(LINE_FEED, offset);
    const header = output.toString("utf8", offset, headerEnd);
    offset = headerEnd + 1;
    if (header.endsWith(" missing")) {
      blobs.set(path, undefined);
      continue;
    }
    const size = Number(header.slice(header.lastIndexOf(" ") + 1));
    blobs.set(path, output.toString("utf8", offset, offset + size));
    offset += size + 1;
  }
  return blobs;
};
