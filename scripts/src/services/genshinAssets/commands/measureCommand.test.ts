import { measureCommand } from "#src/services/genshinAssets/commands/measureCommand";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { defineCommand, runCommand } from "citty";
import { AVATAR_MANIFEST_FILE_NAME } from "genshin-world/sceneExport";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe("measureCommand", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "measure-command-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("a model whose manifest the schema refuses is not measured, so its PMX is never read", async () => {
    expect.hasAssertions();

    writeJsonFile(join(directory, AVATAR_MANIFEST_FILE_NAME), { bones: [], humanoid: {}, materials: {}, meshes: "" });

    await expect(
      runCommand(defineCommand({ subCommands: { measure: measureCommand } }), {
        rawArgs: ["measure", "--model", directory, join(directory, TEST_FILENAME)],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "array",
          "code": "invalid_type",
          "path": [
            "meshes"
          ],
          "message": "Invalid input: expected array, received string"
        }
      ]]
    `);
  });
});
