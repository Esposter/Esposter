import { decompileDxbcDirectory } from "#src/services/genshinAssets/materials/decompileDxbcDirectory";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

// Only off Windows is the refusal taken, so its test is skipped where 3Dmigoto's decompiler is the one that runs
describe.skipIf(process.platform === "win32")(decompileDxbcDirectory, () => {
  test("refuses off Windows, naming the decompiler it lacks", async () => {
    expect.hasAssertions();

    await expect(decompileDxbcDirectory(TEST_FILENAME)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: HLSL, needs 3Dmigoto's decompiler, which runs only on Windows]`,
    );
  });
});
