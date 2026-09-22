import { STATE_DIRECTORY } from "#src/services/constants";
import { getRosterCachePath } from "#src/services/getRosterCachePath";
import { writeRosterCache } from "#src/services/writeRosterCache";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The state directory is the one thing a real write of this needs somewhere else, and everything under it — the
// Temp sibling, the rename, the sweep — is the real one, since the sweep is what this proves. The directory is
// Named inside the factory, which is the one scope that runs before the module under test reads the constant
vi.mock(import("#src/services/constants"), async (importOriginal) => {
  const { tmpdir } = await import("node:os");
  return { ...(await importOriginal()), STATE_DIRECTORY: `${tmpdir()}/genshin-persona-${crypto.randomUUID()}` };
});

describe(writeRosterCache, () => {
  const language = "language";
  const version = "version";
  const currentName = basename(getRosterCachePath(version, language));
  const staleName = basename(getRosterCachePath(" ", language));
  // What another session starting at the same moment has written and not yet renamed over its target
  const temporaryName = `${currentName}.${process.pid + 1}.tmp`;

  beforeEach(() => {
    mkdirSync(STATE_DIRECTORY, { recursive: true });
    for (const name of [staleName, temporaryName]) writeFileSync(join(STATE_DIRECTORY, name), "");
  });

  afterEach(() => {
    rmSync(STATE_DIRECTORY, { force: true, recursive: true });
  });

  test("removes every other cache and leaves the temp another session is writing under", () => {
    expect.hasAssertions();

    writeRosterCache(version, language, []);

    expect(readdirSync(STATE_DIRECTORY).toSorted()).toStrictEqual([currentName, temporaryName].toSorted());
  });
});
