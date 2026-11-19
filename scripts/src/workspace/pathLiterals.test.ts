import { DEFAULT_PARITY_DIRECTORY } from "#src/services/fleet/data/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CONTENT_CACHE_DIRECTORY } from "@esposter/shared-node/cache";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, test } from "vitest";

const readRepositoryFile = (path: string): string => readFileSync(join(REPOSITORY_ROOT, path), "utf8");
// A folder under the home folder, spelled the way a workflow or a mod writes it
const getHomePath = (path: string): string => `~/${relative(homedir(), path).replaceAll("\\", "/")}`;

describe("path literals", () => {
  // A workflow cannot read CONTENT_CACHE_DIRECTORY, so each one spells the mirror's path under the home folder. A rename
  // Moves the constant and not the path, and the cache then misses in silence on every run rather than failing
  const CACHE_PATH = getHomePath(CONTENT_CACHE_DIRECTORY);

  test("the workflows restore the game data mirror from the cache constant's path", () => {
    expect.hasAssertions();

    const cachePaths = [".github/workflows/CI.yaml", ".github/workflows/build-packages.yaml"].flatMap((path) =>
      Array.from(readRepositoryFile(path).matchAll(/^ +path: (?<path>~\/\S+)$/gmu), ({ groups }) => groups?.path),
    );

    expect(new Set(cachePaths)).toStrictEqual(new Set([CACHE_PATH]));
  });

  // The disk-scan mod ships without @esposter/shared-node, so the refusal it shows an agent spells the parity folder
  // Under the data root's default itself. That literal is kept, since the agent runs it as a command, and this test
  // Keeps it on the folder DEFAULT_PARITY_DIRECTORY derives from the data root
  test("the disk-scan refusal names the parity folder under the data root", () => {
    expect.hasAssertions();

    expect(readRepositoryFile("packages/genshin-mods/src/services/diskScan/getDiskScanRefusal.ts")).toContain(
      `\`${getHomePath(DEFAULT_PARITY_DIRECTORY)}\``,
    );
  });
});
