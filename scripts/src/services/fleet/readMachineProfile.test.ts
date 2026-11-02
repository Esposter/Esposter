import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { mkdirSync, rmSync } from "node:fs";
import { afterAll, afterEach, describe, expect, test, vi } from "vitest";

const { directory, profilePath } = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const directory = mkdtempSync(join(tmpdir(), "machine-profile-"));
  return { directory, profilePath: join(directory, "machine.json") };
});

vi.mock(import("#src/services/fleet/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  MACHINE_PROFILE_PATH: profilePath,
}));

describe(readMachineProfile, () => {
  afterEach(() => {
    rmSync(profilePath, { force: true, recursive: true });
  });

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("reads no profile where the machine has written none yet", () => {
    expect.hasAssertions();

    expect(readMachineProfile()).toBeUndefined();
  });

  // A profile that exists but cannot be read is an error to report, since the command that writes it is the fix for a
  // Missing one and would fail on the same path
  test("throws a profile path that cannot be read, rather than reading it as no profile", () => {
    expect.hasAssertions();

    mkdirSync(profilePath);

    expect(() => readMachineProfile()).toThrowErrorMatchingInlineSnapshot(
      `[Error: EISDIR: illegal operation on a directory, read]`,
    );
  });
});
