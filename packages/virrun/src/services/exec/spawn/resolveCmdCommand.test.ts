import { resolveCmdCommand } from "#src/services/exec/spawn/resolveCmdCommand";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(resolveCmdCommand, () => {
  const TEST_FILENAME = "pnpm";
  const TEST_EXTENSION = ".CMD";
  const PATH_EXTENSIONS = ".COM;.EXE;.BAT;.CMD";
  const tracker = createTemporaryDirectoryTracker();

  afterEach(() => {
    tracker.cleanup();
  });

  test("appends each PATHEXT extension to a bare name found under PATH", () => {
    expect.hasAssertions();

    const directory = tracker.create();
    writeFileSync(join(directory, `${TEST_FILENAME}${TEST_EXTENSION}`), "");

    expect(resolveCmdCommand(TEST_FILENAME, { env: { PATH: directory, PATHEXT: PATH_EXTENSIONS } })).toBe(
      join(directory, `${TEST_FILENAME}${TEST_EXTENSION}`),
    );
  });

  test("tries a name already carrying a PATHEXT extension as given", () => {
    expect.hasAssertions();

    const directory = tracker.create();
    writeFileSync(join(directory, `${TEST_FILENAME}${TEST_EXTENSION}`), "");

    expect(
      resolveCmdCommand(`${TEST_FILENAME}${TEST_EXTENSION}`, { env: { PATH: directory, PATHEXT: PATH_EXTENSIONS } }),
    ).toBe(join(directory, `${TEST_FILENAME}${TEST_EXTENSION}`));
  });

  // Windows environment names are case-insensitive, so a `Path` set by a caller is the search path a PATH lookup means
  test("#133 reads the search path whatever the case of its environment name", () => {
    expect.hasAssertions();

    const directory = tracker.create();
    writeFileSync(join(directory, `${TEST_FILENAME}${TEST_EXTENSION}`), "");

    expect(resolveCmdCommand(TEST_FILENAME, { env: { Path: directory, PATHEXT: PATH_EXTENSIONS } })).toBe(
      join(directory, `${TEST_FILENAME}${TEST_EXTENSION}`),
    );
  });

  test("#90 looks a name with a separator up under the working directory, not PATH", () => {
    expect.hasAssertions();

    const directory = tracker.create();
    const subdirectory = join(directory, "node_modules", ".bin");
    mkdirSync(subdirectory, { recursive: true });
    writeFileSync(join(subdirectory, `${TEST_FILENAME}${TEST_EXTENSION}`), "");

    expect(
      resolveCmdCommand(join("node_modules", ".bin", TEST_FILENAME), {
        cwd: directory,
        env: { PATH: "", PATHEXT: PATH_EXTENSIONS },
      }),
    ).toBe(join(subdirectory, `${TEST_FILENAME}${TEST_EXTENSION}`));
  });

  test("resolves to undefined when no directory on PATH holds the command", () => {
    expect.hasAssertions();

    const directory = tracker.create();

    expect(resolveCmdCommand(TEST_FILENAME, { env: { PATH: directory, PATHEXT: PATH_EXTENSIONS } })).toBeUndefined();
  });
});
