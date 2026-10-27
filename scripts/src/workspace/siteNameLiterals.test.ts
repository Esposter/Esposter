import { SITE_NAME } from "@esposter/shared";
import { CONTENT_CACHE_DIRECTORY } from "@esposter/shared-node/cache";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, test } from "vitest";

const readRepositoryFile = (path: string): string => readFileSync(join(REPOSITORY_ROOT, path), "utf8");

describe("site-name literals", () => {
  // A workflow cannot read CONTENT_CACHE_DIRECTORY, so each one spells the mirror's path under the home folder. A rename
  // moves the constant and not the path, and the cache then misses in silence on every run rather than failing
  const CACHE_PATH = `~/${relative(homedir(), CONTENT_CACHE_DIRECTORY).replaceAll("\\", "/")}`;

  test("the workflows restore the game data mirror from the cache constant's path", () => {
    expect.hasAssertions();

    const cachePaths = [".github/workflows/CI.yaml", ".github/workflows/build-packages.yaml"].flatMap((path) =>
      Array.from(readRepositoryFile(path).matchAll(/^ +path: (?<path>~\/\S+)$/gmu), ({ groups }) => groups?.path),
    );

    expect(new Set(cachePaths)).toStrictEqual(new Set([CACHE_PATH]));
  });

  // The disk-scan mod ships without @esposter/shared, so the refusal it shows an agent spells the game's folder itself.
  // That literal is kept, since the agent runs it as a command, and this test keeps it on the folder SITE_NAME builds
  test("the disk-scan refusal names the game's folder the site builds", () => {
    expect.hasAssertions();

    expect(readRepositoryFile("packages/genshin-mods/src/services/diskScan/getDiskScanRefusal.ts")).toContain(
      `\`~/${SITE_NAME}/genshin-parity\``,
    );
  });
});
