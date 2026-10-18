import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { AGENT_DIRECTORY } from "@esposter/configuration";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe } from "vitest";

// The hand-written markdown of the repo, each under its repository-relative path: the root set, the agent tree — its
// Own pages, the skills and the ledgers, but never the machine-local worktrees — one README per workspace member and
// The OpenSpec tree short of its archive. Generated markdown (CHANGELOG) is nobody's to edit, and an archived change is
// The record of what shipped, which ages with the code by design. Every check over the repo's prose reads this one
// Set, so a page added to it is checked by all of them
const ROOT_PAGES = ["AGENTS.md", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "README.md", "SCORE.md", "SECURITY.md"];
const ARCHIVE_PATH_PREFIX = "openspec/changes/archive/";

export const readHandWrittenPages = async () => {
  const globbedPaths = await Array.fromAsync(
    glob(
      [
        `${AGENT_DIRECTORY}/*.md`,
        `${AGENT_DIRECTORY}/skills/**/*.md`,
        `${AGENT_DIRECTORY}/ledgers/**/*.md`,
        "{apps,packages}/*/README.md",
        "scripts/README.md",
        "openspec/**/*.md",
      ],
      { cwd: REPOSITORY_ROOT },
    ),
  );
  const paths = [
    ...ROOT_PAGES,
    ...globbedPaths.map((path) => path.replaceAll("\\", "/")).filter((path) => !path.startsWith(ARCHIVE_PATH_PREFIX)),
  ];
  return Promise.all(
    paths.map(async (path) => ({ markdown: await readFile(join(REPOSITORY_ROOT, path), "utf8"), path })),
  );
};

describe.todo("readHandWrittenPages");
