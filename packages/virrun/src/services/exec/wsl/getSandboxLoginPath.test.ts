import { TEST_DIR, TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { getSandboxLoginPath } from "#src/services/exec/wsl/getSandboxLoginPath";
import { describe, expect, test } from "vitest";

describe(getSandboxLoginPath, () => {
  const driveMount = `/mnt/${TEST_FILENAME}`;

  test("drops every Windows drive mount interop appended, keeping the rest in order", () => {
    expect.hasAssertions();

    // A drive mount with a tail and one without: the second is the whole entry, so an anchor that demanded a
    // Separator would keep it and hand the sandbox a directory of win32 binaries.
    expect(getSandboxLoginPath(`${driveMount}${TEST_DIR}:${TEST_DIR}:${driveMount}:${TEST_DIR}`)).toBe(
      `${TEST_DIR}:${TEST_DIR}`,
    );
  });

  test("keeps the distro's own mounts, which are not drives", () => {
    expect.hasAssertions();

    // `/mnt/wsl` is the distro's own Linux-side mount — only a single-letter mount is a Windows drive.
    const distroMount = "/mnt/wsl";

    expect(getSandboxLoginPath(distroMount)).toBe(distroMount);
  });
});
