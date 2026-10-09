import type { ChildDigest } from "#src/models/fleet/data/ChildDigest";
import type { FileEntry } from "#src/models/fleet/data/FileEntry";

import { createHash } from "node:crypto";

const byName = <T extends { name: string }>(left: T, right: T): number => (left.name < right.name ? -1 : 1);

// A directory's digest: a hash of its direct files' name, size and mtime and its child directories' name and digest,
// Each sorted by name so the order a filesystem lists them in never changes the digest
export const getDirectoryDigest = (files: FileEntry[], children: ChildDigest[]): string => {
  const hash = createHash("sha256");
  for (const file of files.toSorted(byName)) hash.update(`file\t${file.name}\t${file.size}\t${file.mtime}\n`);
  for (const child of children.toSorted(byName)) hash.update(`directory\t${child.name}\t${child.digest}\n`);
  return hash.digest("hex");
};
