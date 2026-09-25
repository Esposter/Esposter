import { AGENT_DIRECTORY } from "@esposter/configuration";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe } from "vitest";

// The hand-written markdown of the repo, each under its repository-relative path: the root set, the agent tree — its
// Own pages, the skills and the ledgers, but never the machine-local worktrees — one README per workspace member and
// The docs site. Generated markdown (CHANGELOG, the TypeDoc output under `public/`) is nobody's to edit, and
// `CLAUDE.md`/`GEMINI.md` are symlinks to `AGENTS.md`. Every check over the repo's prose reads this one set, so a
// Page added to it is checked by all of them
const ROOT_PAGES = ["AGENTS.md", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "README.md", "SCORE.md", "SECURITY.md"];
const repositoryDirectory = join(import.meta.dirname, "..", "..", "..", "..");

export const readHandWrittenPages = async () => {
  const globbedPaths = await Array.fromAsync(
    glob(
      [
        `${AGENT_DIRECTORY}/*.md`,
        `${AGENT_DIRECTORY}/skills/**/*.md`,
        `${AGENT_DIRECTORY}/ledgers/**/*.md`,
        "{apps,packages}/*/README.md",
        "scripts/README.md",
        "apps/web/content/docs/**/*.md",
      ],
      { cwd: repositoryDirectory },
    ),
  );
  const paths = [...ROOT_PAGES, ...globbedPaths.map((path) => path.replaceAll("\\", "/"))];
  return Promise.all(
    paths.map(async (path) => ({ markdown: await readFile(join(repositoryDirectory, path), "utf8"), path })),
  );
};

describe.todo("readHandWrittenPages");
