import { DOCS_DIRECTORY } from "@esposter/configuration";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { describe } from "vitest";

// The top-level docs sections as the tree has them, sorted: the slugs every section-keyed map is held to
export const getDocsSections = async () => {
  const docsDirectory = join(import.meta.dirname, "..", "..", "..", "content", DOCS_DIRECTORY);
  const entries = await readdir(docsDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .toSorted();
};

describe.todo("getDocsSections");
