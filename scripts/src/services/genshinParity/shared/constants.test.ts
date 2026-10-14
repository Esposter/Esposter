import { PARITY_BUILD_DIRECTORY_NAME } from "#src/services/genshinParity/shared/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The scripts own the parity build folder's name, and the root's cache exclusion and the world package's build restate
// it. A rename on either side without the other would leave a stale exclusion or a build the measure does not read.
describe("parity build directory name", () => {
  test("the root cache exclusion names the folder the scripts read", () => {
    expect.hasAssertions();

    expect(readFileSync(join(REPOSITORY_ROOT, "vite.config.ts"), "utf8")).toContain(
      `"${PARITY_BUILD_DIRECTORY_NAME}/**"`,
    );
  });

  test("the world package's parity build writes the folder the scripts read", () => {
    expect.hasAssertions();

    const worldManifest = JSON.parse(
      readFileSync(join(REPOSITORY_ROOT, "packages/genshin-world/package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(worldManifest.scripts["build:parity"]).toContain(`--outDir ${PARITY_BUILD_DIRECTORY_NAME} `);
  });
});
